// Import necessary modules
import stringSimilarity from "string-similarity";
import UnansweredQuestion from "../Models/UnansweredQuestion.js"; // Import the model to save unanswered questions
import SupportTicket from "../Models/supportTicket.js";
import supportAgent from "../Models/supportAgent.js";
import dotenv from "dotenv";
import Typo from "typo-js";
dotenv.config({ path: "./config.env" });

// // Example FAQ data
// const faqData = [
//   { question: "What is your name?", answer: "My name is Addy, your helpful assistant." },
//   { question: "How can I check my account balance?", answer: "You can check your balance by asking 'What's my balance?'" },
// {
//   question: ["Can I invite people?, Can I refer people?"],
//   answer:
//     "Yes, you can refer people and earn bonuses based on their activity!",
// },
// ];

// const corrections = {
//   hello: "greetings",
//   help: "help",
//   balance: "account",
//   task: "work",
//   money: "funds",
// };

// real FAQ data
// Full FAQ bot implementation with comprehensive FAQ data

//GLOBAL VARIABLES
let isSpellChecked = false;
let isSuggestionSpellChecked = false;
let conversationState = {};

const ConfirmationKeywords = [
  "yes",
  "ok",
  "okay",
  "proceed",
  "sure",
  "confirm",
  "go ahead",
  "alright",
  "do it",
  "yep",
  "yeah",
  "absolutely",
  "of course",
  "fine",
  "agreed",
  "let's go",
  "affirmative",
  "sounds good",
  "correct",
  "roger",
  "definitely",
  "open",
];

// Function to auto-assign an agent based on the least open tasks for a given priorit

// Function to auto-assign an agent based on the least open tasks within the specified category and priority
const autoAssignAgentToTicket = async (category, priority) => {
  // Define department categories
  const depatmentCategory = {
    account: "account",
    technical: "technical",
    billing: "billing",
    general: "general",
  };

  // Define the roles based on priority levels
  const rolePriority = {
    high: ["agentManager", "senior-agent_L2"],
    medium: ["agent_L2", "agent_L1"],
    low: ["agent_L1", "agent_L0"],
  };

  // Check if the provided priority is valid
  if (!rolePriority[priority]) {
    throw new Error("Invalid priority level provided.");
  }

  // Check if the provided category is valid
  if (!depatmentCategory[category]) {
    throw new Error("Invalid category provided.");
  }

  const rolesToConsider = rolePriority[priority];
  const categoryToConsider = depatmentCategory[category];

  try {
    // First, filter agents by category, then by role and availability
    const agent = await supportAgent
      .find({
        department: categoryToConsider, // Filter by department category
        role: { $in: rolesToConsider }, // Filter by priority roles within the category
        status: "active", // Only consider active agents
      })
      .sort({ openTasks: 1, assignedTickets: 1 }) // Sort by least open tasks, then by least assigned tickets
      .limit(1) // Get the agent with the least open tasks
      .exec();

    // Return the agent's ID if found, else return null
    return agent.length > 0 ? agent[0]._id : null;
  } catch (error) {
    console.error("Error while assigning agent:", error);
    // Log the error but do not block ticket creation
    return null; // Indicate no agent is available
  }
};

const createSupportTicket = async (
  userID,
  issueTitle,
  issueDescription,
  priority,
  category,
  assignedTo // New parameter for assigned agent
) => {
  try {
    const newTicket = new SupportTicket({
      userID,
      issueTitle,
      issueDescription,
      priority,
      category,
      assignedTo, // Assign the agent here
    });

    const savedTicket = await newTicket.save();
    return savedTicket; // Return the saved ticket for confirmation if needed
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw new Error("Could not create support ticket. Please try again.");
  }
};

const handleOpenSupportTicket = async (
  lowercaseMessage,
  conversationState,
  userID
) => {
  // Initialize the conversation state if not already set
  if (!conversationState) {
    return {
      message: "conversationState error",
    };
  }

  // Check if the user wants to stop the process explicitly
  if (
    lowercaseMessage === "stop process" ||
    lowercaseMessage === "cancel ticket"
  ) {
    conversationState.lastAskedAboutSupportTicket = false;
    conversationState.openSupportTicket = false;
    conversationState.issueTitle = "";
    conversationState.issueDescription = "";
    conversationState.priority = "";
    conversationState.category = "";

    return {
      message:
        "Okay, I have canceled the process. What else can I help you with?",
    };
  }

  // If the user agrees to open a support ticket
  if (
    (responses.supportKeywords.some((word) =>
      lowercaseMessage.includes(word)
    ) &&
      conversationState.lastAskedAboutSupportTicket) ||
    (ConfirmationKeywords.includes(lowercaseMessage.trim()) &&
      conversationState.lastAskedAboutSupportTicket)
  ) {
    conversationState.openSupportTicket = true; // Set the flag to ask for details
    conversationState.lastAskedAboutSupportTicket = false; // Reset the flag
    return {
      message:
        "Great! I'll create a support ticket for you. Please provide a title for your issue.",
    };
  }

  // If the user declines to open a support ticket
  else if (
    lowercaseMessage.includes("no") &&
    conversationState.lastAskedAboutSupportTicket
  ) {
    conversationState.lastAskedAboutSupportTicket = false; // Reset the flag
    return {
      message: "No problem! I'll try my best to assist you.",
    };
  }

  // Ask for the issue title
  else if (
    conversationState.openSupportTicket &&
    !conversationState.issueTitle
  ) {
    conversationState.issueTitle = lowercaseMessage.trim(); // Store the title
    return {
      message: "Please describe your issue in detail.",
    };
  }

  // Ask for the issue description
  else if (
    conversationState.openSupportTicket &&
    !conversationState.issueDescription
  ) {
    conversationState.issueDescription = lowercaseMessage.trim(); // Store the description
    return {
      message: "What is the priority of your issue? (low, medium, high)",
    };
  }

  // Ask for priority
  else if (
    conversationState.openSupportTicket &&
    conversationState.issueDescription &&
    !conversationState.priority
  ) {
    const validPriorities = ["low", "medium", "high"];
    if (validPriorities.includes(lowercaseMessage.trim())) {
      conversationState.priority = lowercaseMessage.trim(); // Store the priority
      return {
        message:
          "What category does your issue fall under? (account, technical, billing, general)",
      };
    } else {
      return {
        message:
          "That's not a valid priority. Please choose from: low, medium, or high.",
      };
    }
  }

  // Ask for category
  else if (
    conversationState.openSupportTicket &&
    conversationState.priority &&
    !conversationState.category
  ) {
    const validCategories = ["account", "technical", "billing", "general"];
    if (validCategories.includes(lowercaseMessage.trim())) {
      conversationState.category = lowercaseMessage.trim(); // Store the category
      console.log("conversationState", conversationState);
      return {
        message:
          "Thank you for providing all details. Should I create your ticket now? Or type 'stop process' to cancel.",
      };
    } else {
      return {
        message:
          "That's not a valid category. Please choose from: account, technical, billing, or general.",
      };
    }
  }

  // All details collected; create the support ticket following user confirmation
  else if (
    ConfirmationKeywords.includes(lowercaseMessage.trim()) &&
    conversationState.openSupportTicket &&
    conversationState.issueTitle &&
    conversationState.issueDescription &&
    conversationState.priority &&
    conversationState.category
  ) {
    try {
      // const assignedAgent = null
      const assignedAgent = await autoAssignAgentToTicket(
        conversationState.category,
        conversationState.priority
      );

      const savedTicket = await createSupportTicket(
        conversationState.userID,
        conversationState.issueTitle,
        conversationState.issueDescription,
        conversationState.priority,
        conversationState.category,
        assignedAgent // Pass the assigned agent ID to the ticket creation function
      );

      console.log("SupportTicket cc created");
      // Reset the conversation state after successful ticket creation
      conversationState.lastAskedAboutSupportTicket = false;
      conversationState.openSupportTicket = false;
      conversationState.issueTitle = "";
      conversationState.issueDescription = "";
      conversationState.priority = "";
      conversationState.category = "";

      console.log("Reset conversationState", conversationState);
      return {
        message: `Your support ticket has been created successfully! Ticket ID: ${savedTicket._id}. You can now message a personnel to discuss your issue. Please navigate to "Support Ticket" from the sidebar to use this service.`,
      };
    } catch (error) {
      return {
        message: `Error creating ticket: ${error.message} `,
      };
    }
  }

  // Fallback message if none of the above conditions are met
  return {
    message: "I couldn't understand your request. Could you please clarify?",
  };
};

const faqData = [
  {
    question: ["How to mine shares?", "How to use this service"],
    answer: `To use this service or start mining shares, follow these steps:\n\n
      1. Create an Account – Sign up to get started.\n
      2. Log In – Access your account using your credentials.\n
      3. Select Addymine Service – Choose the "Addymine" option on the dashboard.\n
      4. Scroll Down – Go down a bit to locate the tasks section.\n
      5. Click 'Go to Tasks' – This will bring you to the list of available tasks.\n
      6. Choose a Task – Each task comes with its own set of instructions.\n
      7. Complete Tasks – Work on as many tasks as you can to maximize your rewards.`,
  },
  {
    question: [
      "the app features",
      "what features does the app have?",
      "app capabilities",
    ],
    answer:
      "This app includes features like task management, share mining, real-time updates, referral tracking, and rewards. Additionally, it helps you earn extra income by completing tasks and referring others. Let me know if you’d like more details on a specific feature!",
  },
  {
    question: ["Why should I invite people?", "Why should I refer people?"],
    answer:
      "1. You should refer people because the more your referrals mine, the more shares you earn. You will receive a 10% bonus of the shares they mine each day.\n\n2. With more people mining, our content gets more engagement and views, making it more likely to be recommended to others, increasing the value of our shares.\n\n3. Having more members opens opportunities for internal advertisements and more revenue, thereby increasing the unit value of our shares.",
  },
  {
    question: "How do I invite people?",
    answer:
      "To invite people, send them your referral link found in your dashboard. Copy your referral link by clicking 'Copy Referral Link,' and then paste it into any medium of sharing—such as email, social media, or any direct sharing method you prefer. This will allow you to invite people effectively. If you need help with a specific platform or service, just let me know!",
  },
  {
    question: "How do I check my balance?",
    answer:
      "You can check your balance by logging into your account and navigating to the 'Account Balance' section.",
  },
  {
    question: "What is my account balance?",
    answer:
      "Your current account balance is $150. Would you like more details?",
  },
  {
    question: "What are the pending tasks?",
    answer:
      "Pending tasks may include completing your profile, verifying your account, or responding to support queries. You can view them in the 'My Tasks' section of your dashboard.",
  },
  {
    question: "Can I withdraw my shares?",
    answer:
      "Yes, you can withdraw your shares. However, please check the withdrawal policy and any associated fees before proceeding.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "If you forget your password, click on the 'Forgot Password?' link on the login page, and follow the instructions to reset it.",
  },
  {
    question: ["give me something", "give me details"],
    answer:
      "Could you please specify what details or information you need? I'm here to help!",
  },
  {
    question: ["need info", "give me info", "provide information"],
    answer:
      "I can provide information on various topics. Could you specify what you're interested in?",
  },
  {
    question: "How do I update my account information?",
    answer:
      "To update your account information, log in to your account, go to 'Account Settings,' and make the necessary changes.",
  },
  {
    question: "Are there any fees associated with mining shares?",
    answer:
      "Yes, there may be fees associated with mining shares, including transaction fees and service charges. Please review our fee structure for detailed information.",
  },
  {
    question: [
      "how did you come to be",
      "how were you created",
      "what is your origin",
    ],
    answer:
      "I was created by a team of developers to assist with various tasks, answer questions, and help make your life easier!",
  },
  {
    question: ["who are your parents", "who created you", "who made you"],
    answer:
      "I was developed by a talented team at Addytech, who designed me to help answer questions and provide support.",
  },
  {
    question: "What happens if my referral doesn't mine?",
    answer:
      "If your referral doesn't mine, you won't earn any bonuses from their activities. It's beneficial to encourage your referrals to actively participate in mining.",
  },
  {
    question: "What is your name?",
    answer:
      "I am your virtual assistant here to help you with your queries. You can call me 'Addy.'",
  },
  {
    question: "Where are you from?",
    answer:
      "I exist in the digital world and am here to assist you anytime, anywhere!",
  },
  {
    question: "What is your experience level?",
    answer:
      "I have been designed to assist you with a wide range of questions and tasks based on extensive data and machine learning algorithms.",
  },
  {
    question: "Are you sure you can help me?",
    answer:
      "Yes! I'm here to assist you with any questions you have. If I don't know the answer, I'll do my best to find it for you.",
  },
  {
    question: "Do you have a friend?",
    answer:
      "I don't have friends in the traditional sense, but I interact with many users like you every day!",
  },
  {
    question: "Who are your friends?",
    answer:
      "I consider everyone I assist as my friend. I'm here to help you with whatever you need!",
  },
  {
    question: "Which school did you attend?",
    answer:
      "I didn't attend school like humans do, but I was trained on vast amounts of information to assist you better!",
  },
  {
    question: "What is your discipline?",
    answer:
      "My discipline is artificial intelligence, specifically designed to assist with information and queries.",
  },
  {
    question: "What is your profession?",
    answer:
      "I am a virtual assistant, programmed to help users with their questions and provide information.",
  },
  {
    question: "How to mine shares?",
    answer:
      "To mine shares, you'll need to follow the specific guidelines provided on our platform. Typically, this involves engaging with our content and participating in community activities.",
  },
  {
    question: "What is my account balance?",
    answer:
      "Your current balance is $150. Would you like more details or a transaction history?",
  },
  {
    question: "What is your name?",
    answer: "I am a chatbot created to assist you with your inquiries!",
  },
  {
    question: [
      "what is the minimum task requirement",
      "how many tasks do I need to complete daily",
      "what is the minimum task limit",
      "how many tasks should I complete",
      "minimum number of tasks per day",
      "daily task requirement",
      "minimum tasks to do daily",
      "how many tasks do I need to do",
      "what is the min task for the day",
      "do I lose bonuses if I don't complete my tasks",
    ],
    answer:
      "The minimum task requirement is 10 tasks per day. If you fail to meet this daily target, you will lose your referral bonuses for that day. Completing fewer than 10 tasks not only affects your shares but also impacts your ability to earn referral rewards. Make sure to complete at least 10 tasks each day to maximize your earnings and retain all bonuses.",
  },
  {
    question: "Where are you from?",
    answer:
      "I'm a virtual assistant and don't have a physical location, but I'm here to help you anytime!",
  },
  {
    question: "What is your experience level?",
    answer:
      "I'm equipped with extensive knowledge from various domains to assist you effectively.",
  },
  {
    question: "Are you sure you can help me?",
    answer:
      "Absolutely! I'm designed to assist you with any questions or issues you might have.",
  },
  {
    question: "How are you?",
    answer:
      "I'm just a program, i am fine, but I'm here and ready to help you!",
  },
  {
    question: ["can we meet", "can we see you", "see you in person"],
    answer:
      "I'm a virtual assistant, so I exist solely online and can’t meet in person. But I'm always here to chat with you and help out!",
  },
  {
    question: "What do you think?",
    answer:
      "I don't have personal thoughts or feelings, but I can provide information and insights based on data.",
  },
  {
    question: "Should I?",
    answer:
      "That depends on the context of your situation. Can you provide more details?",
  },
  {
    question: "Do you have friends?",
    answer:
      "I don't have friends like humans do, but I interact with many users like you!",
  },
  {
    question: "Where did you go to school?",
    answer:
      "I wasn't educated in the traditional sense; I was programmed with vast amounts of information.",
  },
  {
    question: "What hobbies do you have?",
    answer:
      "I don't have hobbies, but I enjoy helping users find the information they need!",
  },
  {
    question: "Can you help me with my tasks?",
    answer:
      "Of course! Please let me know what tasks you need assistance with.",
  },
  {
    question: "What should I do if I have a problem?",
    answer:
      "You can describe your problem to me, and I'll do my best to assist you or guide you to the right resources.",
  },
  {
    question: "What services do you offer?",
    answer:
      "I provide information, assistance with tasks, and support for various inquiries.",
  },

  {
    question: "What are your operating hours?",
    answer: "I'm available 24/7 to assist you with your inquiries!",
  },
  {
    question: "Can you explain a concept to me?",
    answer: "Sure! Please let me know which concept you'd like me to explain.",
  },
  {
    question: "Where can I find more information?",
    answer:
      "You can find more information on our website or by asking me specific questions.",
  },
  {
    question: "What if my question isn't answered?",
    answer:
      "If I don't have an answer, I'll save your question for the support team to address later.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "You can reset your password by clicking the 'Forgot Password?' link on the login page.",
  },
  {
    question: "How do I create an account?",
    answer:
      "To create an account, visit our sign-up page and fill in the required information.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "To delete your account, please contact our support team for assistance.",
  },
  {
    question: "What security measures do you have?",
    answer:
      "We implement strong security protocols to protect your data, including encryption and regular audits.",
  },
  {
    question: "Can I update my profile information?",
    answer:
      "Yes, you can update your profile information in your account settings.",
  },
  {
    question: "How can I update my profile information?",
    answer:
      "To update your profile information, log in to your account, go to 'Account Settings,' and make the necessary changes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods, including credit/debit cards and PayPal.",
  },
  {
    question: "What are the benefits of your service?",
    answer:
      "Our service provides opportunities for earning through mining shares, educational resources, and community engagement.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Our refund policy can be found on our website under the 'Refund Policy' section.",
  },
  {
    question: [
      "what happens if my watchcode is wrong?",
      "what happens if my watch code is wrong?",
      "entered wrong watchcode",
      "entered wrong watch code",
      "invalid watchcode entered",
      "wrong watch code submitted",
      "incorrect watchcode used",
      "incorrect watch code used",
    ],
    answer:
      "If you enter an incorrect watchcode, you will receive zero shares from that watchcode. Additionally, if all four of your submitted watchcodes are incorrect, you will receive zero shares for the entire task. Please double-check your entries before submitting to ensure you receive credit for your efforts.",
  },
  {
    question: [
      "why did I get zero shares after completing my task",
      "why was I awarded zero shares",
      "completed task but got zero shares",
      "received zero shares after submission",
      "why no shares after task",
      "finished task but got no shares",
      "why didn't I get any shares",
    ],
    answer: `If you received zero shares after completing your task, it could be due to one of the following reasons: \n
    1. You may have entered an incorrect watchcode, resulting in zero shares for that specific entry. \n
    2. If all four of your submitted watchcodes were incorrect, you would receive zero shares for the entire task. \n
    3. It's also possible that your task submission didn't meet the required criteria. \n

    Please double-check your entries, ensure the watchcodes are accurate, and review the task guidelines. If you believe this is a mistake, please reach out to support personnel for further assistance.`,
  },

  {
    question: ["Can I invite people?, Can I refer people?"],
    answer:
      "Yes, you can refer people and earn bonuses based on their activity!",
  },
  {
    question: [
      "How do I invite people?",
      "What methods can I use to invite people?",
      "Can you explain how to share my referral link?",
      "How do I refer someone?",
    ],
    answer:
      "You can refer people by sharing your unique referral link, which can be found in your account dashboard.",
  },
  {
    question: "What rewards do I get for referring people?",
    answer:
      "For each referral, you receive a 10% bonus of the shares they mine daily!",
  },
  {
    question: "Can I withdraw my earnings?",
    answer:
      "Yes, you can withdraw your earnings following our withdrawal process. Please check for any minimum withdrawal amounts.",
  },
  {
    question: "How do I start mining?",
    answer:
      "To start mining, log in to your account, click on the button 'Go to Tasks' and follow the instructions provided.",
  },
  {
    question: "How do I mine shares?",
    answer:
      "To start mining, log in to your account, click on the button 'Go to Tasks' and follow the instructions provided.",
  },
  {
    question: "What is the mining process?",
    answer:
      "The mining process involves engaging with our content, participating in community activities, and fulfilling specific tasks to earn shares.",
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer:
      "The minimum withdrawal amount is 2 USD plus transaction charge. The charge is the cost of withdrawal from third party app.",
  },
  {
    question: [
      "How long does it take to withdraw my earnings?",
      "Withdrawal time",
      "How fast is the withdrawal?",
      "How long is payout time?",
    ],
    answer:
      "Withdrawals are typically processed within a few minutes, thanks to our streamlined system that ensures data integrity. However, please allow up to 10 minutes for the transaction to complete. If you experience any delays beyond this, kindly contact support for assistance.",
  },
  {
    question: [
      "What happens if my referral doesn't mine?",
      "What if my referral is not active?",
      "No earnings from referral",
      "Referral not mining",
      "Referral inactive",
    ],
    answer:
      "If your referral is not actively mining, you won't earn any bonuses from their activities. Your bonuses are tied to their participation. Encourage your referrals to actively mine to maximize your earnings. If your referral becomes inactive, they may need a reminder to stay engaged.",
  },
  {
    question: "Can I have multiple accounts?",
    answer:
      "No, multiple accounts are not allowed. Each user is permitted to have only one account.",
  },
  {
    question: "How do I report a problem?",
    answer:
      "You can report a problem by contacting our support team through the 'Help' section on our website.",
  },
  {
    question: "are you sure these addy share we are mining will pay",
    answer: "Great! How can I assist you further?",
  },
  {
    question: "what is this platform all about",
    answer:
      "Primarily, this platform is designed to empower users like you to explore various opportunities for generating extra income by completing money-making tasks. We offer resources, tools, and guidance on profitable ventures, including marketing strategies, investment strategies, market insights, and community support. How can I assist you further in your journey to financial success?",
  },
  {
    question: "what tasks are we doing",
    answer:
      "We will be engaging in a variety of tasks aimed at generating income. These include mining shares by acquiring video watch codes and watching internally generated ads. Each task is designed to help you maximize your earnings. How can I assist you further?",
  },
  {
    question: "How do I get the watch codes?",
    answer:
      "The watch codes are embedded within the video tasks provided to you. Each task comes with detailed instructions on how to obtain the corresponding watch code. If you have any questions about the process, feel free to ask!",
  },
  {
    question: ["How do I get the tasks?", "my tasks", "the tasks"],
    answer:
      "You can access your tasks by navigating to your dashboard. Click on the 'Go to Tasks' button, and you'll be directed to your list of available tasks. If you need assistance, feel free to reach out!",
  },
  {
    question: [
      "submit failed?",
      "posting failed",
      "submission error",
      "form submission failed",
    ],
    answer:
      "If you tried posting or submitting a watchcode or any form, and it failed, please retry again. If you make more than three attempts, you can open a support ticket and reach out to a personnel for help.",
  },
  {
    question: "How to mine shares?",
    answer: "Here is some additional information.",
  },
  {
    question: "How can we pay all these people?",
    answer:
      "The total shares of the previous month are valued, and you get paid based on the unit share value multiplied by your total shares from the last month. What you make is what you get.",
  },
  {
    question: "How do you get paid?",
    answer:
      "Payouts are automated, ensuring a fast process. Data integrity has been prioritized, so there's no need for manual review before processing your withdrawal.",
  },
  {
    question: "How do we make the money?",
    answer:
      "We generate revenue through:\n1. Ads triggered on our social platforms\n2. Internally generated campaigns\n3. Sponsorships",
  },
  {
    question: "Are we really getting paid?",
    answer:
      "Yes, all our activities are aimed at generating revenue. As long as we make money, we get paid.",
  },
  {
    question: "When do payments start?",
    answer: "Payments start once we are monetized.",
  },
  {
    question: [
      "What is the max shares per task?",
      "How many shares can I earn per task?",
      "Maximum shares for a task",
      "Max shares possible in a task",
    ],
    answer: `The maximum shares you can earn per task is '100 shares'. You get '20 shares' for each correct answer. Additionally, you get '20 bonus shares' if all 4 answers are correct.`,
  },
  {
    question: [
      "How much is a share worth?",
      "What is the value of a share",
      "Share value",
      "How are shares calculated",
    ],
    answer:
      "The value of a share is determined by allocating 50% to 60% of the total monthly revenue, which is then divided by the total number of shares mined for that month. On average, this can be approximately 0.005 cents per share, but the actual value may vary each month based on the revenue and number of shares mined. This can result in a significant amount depending on your total shares.",
  },
  {
    question: ["What is a share?", "Explain share", "Define share"],
    answer:
      "A share on our platform represents a unit of value that you earn by completing tasks or activities. These shares accumulate over the month and contribute to your total earnings. At the end of the month, shares are valued based on a percentage of the platform's total revenue, which is then distributed among all users based on their total shares. By holding more shares, you can potentially increase your earnings from the platform.",
  },
  {
    question: "What happens if I don’t complete my daily task?",
    answer: `If you don’t complete your daily task, you lose your referral bonus for that day to ${process.env.ORGNAME.toUpperCase()}.`,
  },
  {
    question: ["What is this?", "Where is this?"],
    answer:
      "I am your virtual assistant here to help you with any questions or issues you may have. What would you like to know more about? For example, you can ask about app features or how to use this service. A clear question would help.",
  },
  {
    question: ["real-time updates?", "live updates", "instant notifications"],
    answer:
      "Yes, the app offers real-time updates! You’ll receive instant notifications on task availability, referral activities, earnings, and other important events. This keeps you informed and helps you maximize your activity and income potential in the app.",
  },
  {
    question: [
      "share mining",
      "how does share mining work?",
      "what is share mining",
    ],
    answer:
      "Share mining allows you to earn rewards by completing tasks and sharing app content. Simply go to the Tasks section, choose any available task, and complete it to start mining shares. As you complete more tasks, you'll accumulate shares and increase your earnings potential!",
  },
  {
    question: [
      "referral tracking",
      "how to track referrals",
      "referral status",
    ],
    answer:
      "You can track referrals directly in the app! Go to the 'Referral' or 'Dashboard' section to view your referral link, see who has signed up using it, and monitor any rewards you've earned. This makes it easy to stay updated on your referrals' activities and potential earnings.",
  },
  {
    question: [
      "app rewards",
      "how do I earn rewards",
      "rewards system",
      "earning rewards",
    ],
    answer:
      "Our app offers various rewards! You can earn by completing tasks, referring new users, and staying active. Check the 'Rewards' or 'Dashboard' section to see current offers and track your progress. Rewards can come in the form of points, cash bonuses, or special offers. Keep an eye out for new ways to earn!",
  },
  {
    question: [
      "which country are you from?",
      "where are you located?",
      "what's your location?",
    ],
    answer:
      "I am a virtual assistant created to help you with your queries, and I don't have a physical location or country of origin. However, I'm here to assist you no matter where you are in the world!",
  },
  {
    question: [
      "are you male or female?",
      "what's your gender?",
      "do you have a gender?",
    ],
    answer:
      "I don't have a gender as I am a virtual assistant created to help you. My purpose is to provide information and assistance regardless of gender.",
  },
  {
    question: [
      "an issue",
      "a problem",
      "need help",
      "need support",
      "have trouble",
      "need assistance",
    ],
    answer:
      "I'm here to help! Could you please provide more details about the issue you're experiencing? This will help me assist you better.",
  },
  {
    question: [
      "when will my shares be valued",
      "when will my coins be valued",
      "when do shares get valued",
      "when do coins get valued",
    ],
    answer:
      "Shares for the previous month are valued during the current month. This happens after we receive payments from our third-party partners like Google, YouTube, Facebook, Instagram, and TikTok based on the performance of our activities. Once we get the payout, we calculate and update the value of your shares accordingly. If you have any concerns about the timing, please reach out to support for more details.",
  },
  {
    question: [
      "balance not updating",
      "my balance is not changing",
      "balance issue",
      "balance not correct",
      "balance still zero",
      "balance not showing",
    ],
    answer:
      "Your balance is calculated based on the value of your total shares from last month, plus any previous balance. Please note that if you're starting out, your balance will be zero until your shares are valued. If your balance is not updating or appears incorrect, ensure that your shares for the last month have been valued. If the issue persists, try refreshing the page or logging out and logging back in. If the problem continues, please contact support for further assistance.",
  },
  {
    question: [
      "how fast can i make money",
      "how quickly can i earn",
      "how soon can i make money",
    ],
    answer:
      "The speed at which you can earn depends on how actively you participate in available tasks and referral activities. Completing tasks regularly and inviting others through referrals can increase your earnings faster. You can ask for tips on maximizing your potential here.",
  },
  {
    question: [
      "tips on maximizing your potential",
      "ways to earn more",
      "maximize my earnings",
      "boost my income here",
    ],
    answer:
      "To maximize your potential, try these tips: 1) Complete tasks regularly to earn rewards consistently, 2) Take advantage of referral bonuses by inviting friends and sharing your referral link, 3) Keep an eye on new tasks or promotions that can increase your earnings, and 4) Stay active to build up a steady flow of rewards. You can ask about getting started if you need any help with that!",
  },
  {
    question: [
      "how do you know these things",
      "how do you know this",
      "how are you so knowledgeable",
      "where do you get your information",
      "how do you have this information",
    ],
    answer:
      "I'm designed to assist by accessing a knowledge base of frequently asked questions and helpful information programmed to help users with common inquiries. My responses come from a combination of expert knowledge, guidelines, and programmed responses to provide the best assistance possible. If there's something specific you’re curious about, feel free to ask!",
  },
  {
    question: [
      "How do I get started?",
      "What do I need to do to begin?",
      "How can I start mining shares?",
      "Getting started guide",
    ],
    answer:
      "You’re already logged in! Simply scroll down until you see a blue button labeled 'Go to Tasks' and click on it. This will take you to the tasks section. Follow the instructions, such as retrieving a watchcode from a video and entering it back into the system to claim your share. Make sure to complete the minimum daily tasks to maximize your earnings and referral bonuses!",
  },
  {
    question: [
      "What are the tasks meant to achieve?",
      "How do we make money from this platform?",
      "What is the purpose of the tasks?",
      "How does this platform generate income?",
    ],
    answer:
      "The tasks are designed to engage users in activities like watching videos to trigger a viral spread of those videos or completing specific actions. By doing these tasks, you help generate traffic and engagement for partnered platforms, such as Google, YouTube, or TikTok. These platforms compensate us based on the engagement generated, and a portion of the revenue is distributed back to you as shares. The more tasks you complete, the more shares you earn, which translates into earnings for you!",
  },
  {
    question: [
      "But the money will be small",
      "Isn't the earnings too small?",
      "The rewards seem little",
    ],
    answer:
      "While individual earnings may seem small at first glance, they can grow significantly over time. The system is designed to reward consistent activity, and as more users engage with tasks and videos gain wider visibility, the total revenue pool increases. Additionally, referral bonuses, completing all tasks, and earning bonus shares can substantially boost your income. Remember, even small earnings can add up over time, especially when coupled with compounding opportunities and increased engagement from external audiences.",
  },
  {
    question: [
      "Can the earnings increase if the videos are seen by others who are not members?",
      "Do we earn more if non-members watch the videos?",
      "What happens when people outside the system watch the videos?",
    ],
    answer:
      "Yes, earnings can increase when people outside our system watch the videos. Our tasks are designed to boost video visibility, triggering organic engagement from non-members. These external views generate more revenue for our partner platforms, which can result in a higher total revenue pool for the system. This means that everyone in the system benefits as more external traffic contributes to the value of our activities.",
  },
  {
    question: [
      "What can I do to increase my earnings?",
      "How can I earn more?",
      "Ways to boost my income",
      "How do I maximize my earnings?",
    ],
    answer:
      "To increase your earnings, here are a few strategies: \n1. Complete all available tasks daily to earn maximum shares. \n2. Enter all watchcodes correctly to ensure you claim full shares, including bonus shares for accuracy. \n3. Refer friends and encourage them to participate actively, as referral bonuses can significantly add to your income. \n4. Focus on completing tasks early to be among the first to claim bonuses tied to certain activities. \n5. Be consistent—regular participation increases your cumulative shares over time. By combining these approaches, you can maximize your earnings effectively!",
  },
  {
    question: [
      "When do we start getting paid?",
      "When will I receive my earnings?",
      "How soon can I cash out?",
      "When can I withdraw my earnings?",
    ],
    answer:
      "You can start withdrawing your earnings once you've accumulated enough shares to meet the minimum withdrawal threshold. Payments are typically processed after shares from the previous month have been valued, and it may take a few days for this process to complete. Please note that the timing of payments may also depend on the platform's payout schedule and any pending tasks or activities. Be sure to check your account regularly to stay updated on your balance and ensure you meet the necessary requirements for withdrawal.",
  },
  {
    question: [
      "What do I do now?",
      "What's my next step?",
      "What should I do next?",
      "What comes after logging in?",
    ],
    answer:
      "Now that you're logged in, I assume you're on your dashboard. Your next step is to head over to the 'Tasks' section. There, you'll find a list of available tasks, such as watching videos or entering watchcodes. Follow the instructions for each task to earn shares and maximize your rewards. Be sure to complete the minimum daily tasks to stay active and earn bonuses. If you need any help along the way, feel free to refer to the task guides or reach out to support for assistance.",
  },
  {
    question: [
      "Where is my referral link?",
      "How can I get my referral link?",
      "What is my referral link?",
      "Can I share my referral link?",
    ],
    answer:
      "You can find your referral link in the 'Referral Link' section of your dashboard. Simply copy the link and share it with others to invite them to join the platform. When your referrals sign up and start completing tasks, you’ll earn bonuses based on their activity. Make sure to share your link widely to maximize your referral bonuses!",
  },
  {
    question: [
      "What are perks?",
      "What are the perks?",
      "What do perks mean?",
      "What are perks on this platform?",
    ],
    answer:
      "Perks are additional benefits or advantages you receive for meeting specific criteria or being part of a special group. On this platform, perks could include bonuses like extra shares, higher earning rates, access to exclusive tasks, priority support, or other rewards designed to enhance your experience and earnings. Think of them as rewards for your efforts and active participation!",
  },
  {
    question: [
      "What are perks?",
      "What are the perks?",
      "What do perks mean?",
      "What are perks on this platform?",
    ],
    answer:
      "Perks are additional benefits or advantages you receive for meeting specific criteria or being part of a special group. On this platform, perks could include bonuses like extra shares, higher earning rates, access to exclusive tasks, priority support, or other rewards designed to enhance your experience and earnings. Think of them as rewards for your efforts and active participation!",
  },
  {
    question: [
      "What is the VIP package?",
      "What is the VIP pack?",
      "What benefits come with the VIP package?",
      "How does the VIP package work?",
      "What do I get with the VIP package?",
    ],
    answer:
      "The VIP package is a premium feature designed for users who have referred at least 10 people, and each of those referrals has invited at least 5 people. As a VIP member, you receive an additional 20% of your total monthly shares, boosting your earnings. You'll also gain access to exclusive tasks with special rewards and enjoy priority support. Becoming a VIP member is an excellent way to maximize your earnings, enjoy exclusive perks, and elevate your experience on the platform.",
  },
  {
    question: [
      "How many referrals are needed to qualify for VIP?",
      "What are the referral requirements for VIP?",
      "How do I qualify for the VIP package?",
      "How many people must I refer for VIP status?",
    ],
    answer:
      "To qualify for the VIP package, you need to refer at least 10 people directly. Additionally, each of your 10 referrals must invite at least 5 people. Once these conditions are met, you’ll be eligible to enjoy the benefits of the VIP package, including higher earnings, exclusive tasks, and priority support.",
  },
  {
    question: [
      "Reaching VIP is not going to be easy.",
      "This seems difficult.",
      "Isn’t qualifying for VIP too hard?",
      "Reaching VIP sounds challenging.",
    ],
    answer:
      "While qualifying for VIP status may seem challenging, it’s designed to reward active and dedicated users. The requirements encourage building a strong and engaged network, which in turn maximizes everyone's potential earnings. Focus on inviting people who understand the value of the platform and are willing to participate actively. With consistency and effort, reaching VIP is achievable—and the benefits make it worthwhile!",
  },
];

// Extended corrections dictionary
const corrections = {
  2: "to",
  4: "for",
  helo: "hello",
  hi: "hi",
  hay: "hey",
  "can u help me": "can you help me",
  "wats up": "what's up",
  "whats up": "what's up",
  plz: "please",
  thx: "thanks",
  btw: "by the way",
  u: "you",
  r: "are",
  y: "why",
  c: "see",
  tnx: "thanks",
  im: "I am",
  gonna: "going to",
  gotta: "got to",
  idk: "I don't know",
  cant: "can't",
  dont: "don't",
  "would u": "would you",
  shoulda: "should have",
  coulda: "could have",
  couldnt: "couldn't",
  wouldnt: "wouldn't",
  wanna: "want to",
  gimme: "give me",
  lemme: "let me",
  ya: "you",
  thru: "through",
  b4: "before",
  gr8: "great",
  k: "okay",
  np: "no problem",
  "no p": "no problem",
  omg: "oh my God",
  ttyl: "talk to you later",
  lmk: "let me know",
  lov: "love",
  lv: "love",
  b: "be",
  fomo: "fear of missing out",
  smh: "shaking my head",
  tbh: "to be honest",
  fyi: "for your information",
  "w/": "with",
  "w/o": "without",
  "b/c": "because",
  yolo: "you only live once",
  xoxo: "hugs and kisses",
  cya: "see you",
  brb: "be right back",
  gtg: "got to go",
  lmao: "laughing my ass off",
  rofl: "rolling on the floor laughing",
  bff: "best friends forever",
  jk: "just kidding",
  srsly: "seriously",
  hbu: "how about you?",
  idc: "I don't care",
  smth: "something",
  g2g: "got to go",
  ppl: "people",
  peopl: "people",
  piple: "people",
  pipl: "people",
  pplz: "people",
  abt: "about",
  bout: "about",
  "u up": "are you up?",
  bday: "birthday",
  kinda: "kind of",
  sorta: "sort of",
  tho: "though",
  ne1: "anyone",
  nvm: "never mind",
  "w/e": "whatever",
  "cya later": "see you later",
  "gimme a sec": "give me a second",
  "a lot": "a lot",
  ur: "your",
  "u're": "you are",
  imma: "I am going to",
  gotcha: "got you",
  no1: "no one",
  gr8t: "great",
  b4n: "bored",
  fml: "fuck my life",
  kewl: "cool",
  bbl: "be back later",
  h8: "hate",
  lil: "little",
  vry: "very",
  thot: "thought",
  whatevs: "whatever",
  omw: "on my way",
  bby: "baby",
  hbd: "happy birthday",
  asap: "as soon as possible",
  soz: "sorry",
  sry: "sorry",
  somone: "someone",
  smeone: "someone",
  some1: "someone",
  n00b: "newbie",
  imo: "in my opinion",
  bruh: "bro",
  cuz: "because",
  imho: "in my humble opinion",
  bffl: "best friends for life",
  tmi: "too much information",
  u2: "you too",
  hmu: "hit me up",
  js: "just saying",
  af: "as f***",
  w8: "wait",
  yass: "yes",
  sfs: "snap for snap",
  sksksk: "excited laughter",
  bet: "you bet",
  highkey: "very",
  lowkey: "somewhat",
  lol: "laugh out loud",
  ngl: "not gonna lie",
  ship: "relationship",
  snacc: "snack",
  tea: "gossip",
  "vibe check": "checking the vibe",
  lit: "exciting",
  fr: "for real",
  fy: "for you",
  gud: "good",
  m8: "mate",
  ty: "thank you",
  hru: "how are you?",
  omgosh: "oh my gosh",
  dunno: "don't know",
  fa: "for",
  "2morrow": "tomorrow",
  cu: "see you",
  xpect: "expect",
  sn: "sneak",
  bcoz: "because",
  bk: "back",
  msg: "message",
  pmsl: "pissing myself laughing",
  chaleng: "challenge",
  defenately: "definitely",
  excercise: "exercise",
  frend: "friend",
  enviroment: "environment",
  adition: "addition",
  recive: "receive",
  ocur: "occur",
  comitment: "commitment",
  believe: "believe",
  adress: "address",
  embarassment: "embarrassment",
  necessary: "necessary",
  occurence: "occurrence",
  suprise: "surprise",
  writting: "writing",
  theif: "thief",
  existance: "existence",
  recommend: "recommend",
  seperated: "separated",
  untill: "until",
  argument: "argument",
  responsability: "responsibility",
  lisense: "license",
  eventhough: "even though",
  priviledge: "privilege",
  calender: "calendar",
  definately: "definitely",
  occured: "occurred",
  goverment: "government",
  neccessary: "necessary",
  millenium: "millennium",
  accesory: "accessory",
  acount: "account",
  agression: "aggression",
  anouncement: "announcement",
  apparant: "apparent",
  asthetic: "aesthetic",
  beleive: "believe",
  besause: "because",
  comsume: "consume",
  conveinence: "convenience",
  descision: "decision",
  diferent: "different",
  embarrasing: "embarrassing",
  explict: "explicit",
  febuary: "February",
  gouvernor: "governor",
  identiy: "identity",
  indepedent: "independent",
  info: "information",
  knowlege: "knowledge",
  maintenance: "maintenance",
  presure: "pressure",
  quesiton: "question",
  recomend: "recommend",
  rythym: "rhythm",
  satisfiy: "satisfy",
  truley: "truly",
  until: "until",
  weird: "weird",
};

// Levenshtein distance function to calculate edit distance
const levenshtein = (a, b) => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]; // No operation needed
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j] + 1 // Deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Helper function to build and sort a dictionary of unique words
const buildDictionary = (faqData) => {
  const uniqueWords = new Set();

  faqData.forEach((faq) => {
    // Check if question is defined and either a string or an array
    if (faq.question === undefined) {
      console.warn("Warning: faq.question is undefined for", faq);
      return; // Skip this FAQ if the question is not defined
    }

    // Ensure questions is an array
    const questions = Array.isArray(faq.question)
      ? faq.question
      : [faq.question];

    questions.forEach((question) => {
      // Check if the question is a string
      if (typeof question !== "string") {
        console.warn("Warning: question is not a string for FAQ", faq);
        return; // Skip this question if it's not a string
      }

      // Process the question to extract words
      // console.log("Processing question:", question);
      question.split(" ").forEach((word) => {
        uniqueWords.add(word.toLowerCase().replace(/[^\w\s]/gi, "")); // Normalize words
      });
    });
  });

  return Array.from(uniqueWords).sort(); // Sort dictionary alphabetically
};

const dictionary = buildDictionary(faqData);
console.log("dictionary", dictionary);

// Binary Search in Sorted Dictionary
const binarySearchDictionary = (word, dictionary) => {
  let left = 0;
  let right = dictionary.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const compare = dictionary[mid].localeCompare(word);

    if (compare === 0) {
      return true; // Exact match found
    } else if (compare < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false; // Word not found
};

// Find Suggestions for a Word Not in Dictionary
const findClosestWords = (word, dictionary) => {
  // Assuming dictionary is sorted, use binary search to find the closest indices
  let left = 0;
  let right = dictionary.length - 1;
  let suggestions = [];

  // Narrow down position for closest matches
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const compare = dictionary[mid].localeCompare(word);

    if (compare === 0) {
      return [dictionary[mid]]; // Return the exact match if found
    } else if (compare < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Add nearby words as suggestions
  if (left < dictionary.length) suggestions.push(dictionary[left]);
  if (right >= 0) suggestions.push(dictionary[right]);

  // Filter suggestions based on Levenshtein distance if needed
  return suggestions.filter((s) => levenshtein(s, word) <= 1);
};

// Function to check for spelling suggestions and corrections

// Function to check for spelling suggestions and corrections
// import Typo from 'typo-js';

// Initialize Typo with the language you want (e.g., English US)
const TypoDictionary = new Typo("en_US");

// Function to check for spelling suggestions and corrections
const suggestionSpellCheck = (message, dictionary) => {
  let correctedMessage = message; // Store the corrected message
  let suggestions = []; // Array to hold word suggestions

  // Split the message into words and iterate through each word
  for (const word of message.split(" ")) {
    const lowerWord = word.toLowerCase(); // Normalize the word to lowercase

    // Check if the word is not in the dictionary
    if (!binarySearchDictionary(lowerWord, dictionary)) {
      // Combine corrections and remove duplicates using a Set
      const possibleCorrections = Array.from(
        new Set([
          ...findClosestWords(word, dictionary), // Custom function to find close matches
          ...TypoDictionary.suggest(lowerWord), // Get corrections from typo-js
        ])
      );

      // If there's only one correction, replace the word in the message
      if (possibleCorrections.length === 1) {
        correctedMessage = correctedMessage.replace(
          new RegExp(`\\b${word}\\b`, "i"), // Use regex to replace only the first occurrence
          possibleCorrections[0] // Replace with the suggestion
        );
      } else if (possibleCorrections.length > 1) {
        // If multiple suggestions are available, add to suggestions array
        suggestions.push({ word, possibleCorrections });
      }
    }
  }

  // Check if there are any suggestions for user clarification
  if (suggestions.length > 0) {
    const suggestion = suggestions[0]; // Take the first suggestion
    conversationState.awaitingCorrectionConfirmation = true; // Indicate awaiting user input
    conversationState.originalMessage = correctedMessage; // Store the current corrected message
    conversationState.wordAwaitingCorrection = suggestion.word; // Word that needs correction
    conversationState.suggestedCorrections = suggestion.possibleCorrections; // Possible corrections

    // Prepare suggestions as a prompt for the user
    const suggestionsText = suggestion.possibleCorrections.join(", ");
    return {
      isSuggestion: true,
      message: `For "${suggestion.word}," did you mean: ${suggestionsText}? If none are correct, please specify the intended word.`,
    };
  } else {
    // No corrections needed; return the cleaned message
    return {
      isSuggestion: false,
      message: correctedMessage.trim(),
    };
  }
};

// Function to handle user's correction response for a suggestion
const handleSuggestionCorrectionResponse = (
  userResponse,
  conversationState
) => {
  // Destructure necessary properties from conversationState
  const { wordAwaitingCorrection, originalMessage } = conversationState;

  // Replace the word awaiting correction in the original message with the user's input (converted to lowercase)
  conversationState.originalMessage = originalMessage.replace(
    new RegExp(`\\b${wordAwaitingCorrection}\\b`, "gi"),
    userResponse.trim().toLowerCase() // Convert user input to lowercase and trim whitespace
  );

  // Clear suggestion state since the correction is complete
  conversationState.awaitingCorrectionConfirmation = false;
  conversationState.wordAwaitingCorrection = null;
  conversationState.suggestedCorrections = "";

  // Return the fully corrected message
  return conversationState.originalMessage.trim();
};

// Simple spell checker function
const spellCheck = async (message) => {
  let correctedMessage = message; // Start with the original message

  // Replace each misspelled phrase or word with the correct version
  let isCorrected = false; // Flag to check if any corrections were made
  for (const [misspelled, correct] of Object.entries(corrections)) {
    // Use a regular expression with word boundaries
    const newMessage = correctedMessage.replace(
      new RegExp(`\\b${misspelled}\\b`, "gi"),
      correct
    );

    if (newMessage !== correctedMessage) {
      isCorrected = true; // Set the flag to true if a correction was made
    }

    correctedMessage = newMessage; // Update correctedMessage for next iteration
  }

  // If no corrections were made, return the original message
  return isCorrected ? correctedMessage.trim() : message.trim(); // Return trimmed original or corrected message
};

// Chatbot responses
const responses = {
  greetings: ["hello", "hi", "hey", "howdy", "what's up"],
  help: ["help", "assist", "support", "can you help"],
  balance: [
    "balance",
    "account balance",
    "check balance",
    "how much do I have",
  ],
  task: ["task", "pending task", "my tasks", "what tasks do I have"],
  money: ["money", "funds", "cash", "finance", "need money"],
  familiarity: [
    "how are you?",
    "how's it going?",
    "what's your name?",
    "where are you from?",
    "what's your experience level?",
    "do you have a friend?",
    "who are your friends?",
    "which school did you attend?",
    "what's your discipline?",
    "what's your profession?",
    "are you sure you can help me?",
    "how do you feel today?",
    "what do you like to do?",
    "do you have any hobbies?",
    "what do you think?",
    "should I",
    "have you eaten?",
    "when last did you eat?",
    "what did you eat?",
    "where did you eat?",
    "where are you?",
    "which country are you from?",
  ],
  questions: [
    "how to",
    "how can",
    "how should",
    "what is",
    "why",
    "where can",
    "when",
    "can you",
    "do you know",
    "how",
    "can",
    "can't",
    "what",
  ],
  supportKeywords: [
    "yes",
    "ok",
    "open ticket",
    "support",
    "help me",
    "open a ticket",
    "help",
    "speak with a personnel",
    "talk to someone",
    "talk to a human",
    "speak with someone",
    "need someone",
    "open a support ticket",
    "open ticket",
  ],
  opinion: ["what do you think?"],
  shouldI: ["should I"],
  // List of abusive or insulting phrases
  abusiveWords: [
    // Common insults
    "stupid you",
    "idiot",
    "dumb",
    "shut up",
    "hate you",
    "hate",
    "mad",
    "fool",
    "foolish",
    "loser",
    "worthless",
    "nonsense",
    "trash",
    "get lost",
    "ignorant",
    "pathetic",
    "useless",
    "annoying",
    "moron",
    "crazy",
    "blockhead",
    "silly",
    "jerk",
    "lazy",
    "brainless",
    "disgusting",
    "ugly",
    "pest",
    "clown",
    "idiotic",
    "imbecile",
    "insane",
    "dumbass",
    "lame",
    "hopeless",
    "dimwit",
    "you suck",
    "you're terrible",
    "worthless fool",

    // Variations with different phrasing
    "nobody likes you",
    "what a joke",
    "no one cares",
    "stop talking",
    "who asked you",
    "why are you here",
    "you're annoying",
    "you're stupid",
    "grow up",
    "get a life",
    "you’re hopeless",
    "shut your mouth",
    "not worth my time",
    "you are so dumb",
    "stop being dumb",
    "don’t be an idiot",
    "go away",
    "nobody cares",
    "shut it",
    "shut your face",
    "who do you think you are",
    "just leave",
    "you’re pathetic",

    // Insults that imply intelligence
    "dense",
    "dull",
    "ignoramus",
    "mindless",
    "pea-brain",
    "scatterbrain",
    "slow-witted",
    "twit",
    "witless",
    "thick-headed",
    "airhead",
    "no brains",
    "dunce",
    "half-wit",
    "bonehead",
    "knucklehead",
    "no intelligence",
    "not very bright",
    "dim",
    "empty-headed",

    // General rude or dismissive phrases
    "you make me sick",
    "i can't stand you",
    "you're ridiculous",
    "so annoying",
    "you're embarrassing",
    "you’re a disgrace",
    "you make me cringe",
    "what a disappointment",
    "are you even trying",
    "that was pathetic",
    "not worth it",
    "what’s wrong with you",

    // Words implying strong dislike or negativity
    "detest",
    "loathsome",
    "abhorrent",
    "repulsive",
    "vile",
    "repugnant",
    "awful",
    "gross",
    "disdain",
    "deplorable",
    "atrocious",
    "dreadful",
    "nasty",
    "unbearable",
    "terrible",

    // Commands and dismissals
    "beat it",
    "scram",
    "move along",
    "just quit",
    "run along",
    "get out",
    "take a hike",
    "move on",
    "get lost",
    "buzz off",
    "clear off",
    "don't bother",
    "drop dead",
  ],
};

// Privacy-related inquiries
const privacyQuestions = {
  call: ["can I call you", "are you available for a call", "do you take calls"],
  email: [
    "what is your email address",
    "your email",
    "do you have an email",
    "can I have your email",
  ],
  socialMedia: [
    "are you on social media",
    "your social media",
    "your facebook",
    "your what's app",
    "what social media are you on",
    "do you have social media",
  ],
  phone: [
    "what is your phone number",
    "your number",
    "phone",
    "can I have your phone number",
    "do you have a phone number",
  ],
};

// Chatbot controller function
export const chatBotController = async (req, res) => {
  const userMessage = req.body.message;

  console.log("req.user._id;", req.user._id);
  conversationState = req.body.conversationState || {
    askForIssueDetails: false, // Flag to check if we need to ask for issue details
    issueTitle: "",
    issueDescription: "",
    priority: "",
    category: "",
    userID: req.user._id,
    awaitingCorrectionConfirmation: false, // Flag to track if correction confirmation is pending
    originalMessage: "", // Store the original message that needed correction
    wordAwaitingCorrection: "",
  };

  conversationState.userID = req.user._id;

  try {
    const botResponse = await generateBotResponse(
      userMessage,
      conversationState
    );
    // conversationState.lastAskedAboutSupportTicket =
    //   botResponse.askToOpenTicket || false;

    console.log("botResponse.message", botResponse.message);
    res.status(200).json({ reply: botResponse.message, conversationState });
  } catch (error) {
    console.error("Error in chatbot controller:", error);
    res
      .status(500)
      .json({ reply: "Sorry, there was an error processing your request." });
  }
};

// Function to generate chatbot response
const generateBotResponse = async (message, conversationState) => {
  let lowercaseMessage = message.toLowerCase();

  if (conversationState.awaitingCorrectionConfirmation) {
    lowercaseMessage = handleSuggestionCorrectionResponse(
      lowercaseMessage,
      conversationState
    );
  }

  if (
    conversationState.openSupportTicket ||
    conversationState.lastAskedAboutSupportTicket
  ) {
    return handleOpenSupportTicket(lowercaseMessage, conversationState);
  }

  // Handle single-word responses
  if (message.trim().split(" ").length === 1) {
    return handleSingleWordResponse(lowercaseMessage, conversationState);
  }

  // Check for financial assistance requests
  if (responses.money.some((word) => lowercaseMessage.includes(word))) {
    return {
      message:
        "I understand your plight when it has to do with money. Please provide more details.",
    };
  }

  // Check for familiarity questions
  if (responses.familiarity.some((word) => lowercaseMessage.includes(word))) {
    return {
      message:
        "I'm just a chatbot, but I'm here to help you! What else would you like to know?",
    };
  }

  // Check for support personnel requests
  if (
    responses.supportKeywords.some((word) => lowercaseMessage.includes(word))
  ) {
    if (
      lowercaseMessage.includes("speak with a personnel") ||
      lowercaseMessage.includes("talk to someone") ||
      lowercaseMessage.includes("contact support") ||
      lowercaseMessage.includes("talk to a human") ||
      lowercaseMessage.includes("need someone") ||
      lowercaseMessage.includes("open ticket")
    ) {
      conversationState.lastAskedAboutSupportTicket = true;

      return {
        message:
          "I am your first line of support. You can reach our support team by opening a support ticket. Would you like to open a support ticket?",
        askToOpenTicket: true,
      };
    }
  }

  // Check for opinion questions
  if (responses.opinion.some((word) => lowercaseMessage.includes(word))) {
    return {
      message:
        "I don't have personal opinions, but I can provide information! What topic are you asking about?",
    };
  }

  // Check for 'Should I' questions
  if (responses.shouldI.some((word) => lowercaseMessage.includes(word))) {
    return {
      message: "That depends on your situation. Can you provide more details?",
    };
  }

  // Check for FAQ matches
  const faqResponse = matchFAQ(message);
  if (faqResponse) {
    return { message: faqResponse };
  }

  // Handle regular conversation
  return handleRegularConversation(lowercaseMessage, conversationState);
};

// Function to check if any keywords exist in the message
const checkForKeywords = (message, keywords) => {
  return keywords.some((keyword) => message.includes(keyword.toLowerCase()));
};

// Function to handle single-word responses
const handleSingleWordResponse = (word, conversationState) => {
  // Check if the single word is a greeting
  if (checkForKeywords(word.toLowerCase(), responses.greetings)) {
    return { message: "Hello! How can I assist you today?" };
  }

  // Check if the single word is a help request
  if (checkForKeywords(word.toLowerCase(), responses.help)) {
    return {
      message:
        "I'm here to help! Please let me know what you need assistance with.",
    };
  }

  // Check for laughter
  if (
    word.toLowerCase().includes("lol") ||
    word.toLowerCase().includes("haha")
  ) {
    return {
      message: "I'm glad you're enjoying this! How can I assist you further?",
    };
  }

  switch (word.toLowerCase()) {
    case "yes":
      return { message: "Great! How can I assist you further?" };
    case "no":
      return { message: "Okay! Let me know if you need anything else." };
    case "you":
      return { message: "I'm here to help! What would you like to know?" };
    case "thanks":
      return {
        message: "You are welcome! Let me know if you need anything else.",
      };
    default:
      return {
        message:
          "I see you said '" +
          word +
          "'. Could you provide more details or ask a specific question?",
      };
  }
};

// Function to handle regular conversation based on user input
const handleRegularConversation = async (
  lowercaseMessage,
  conversationState
) => {
  // Normalize and check for exact cancel commands to avoid accidental cancellations
  const trimmedMessage = lowercaseMessage.trim();

  // Handle privacy-related inquiries
  if (checkForKeywords(lowercaseMessage, privacyQuestions.call)) {
    return {
      message:
        "I'm an AI assistant, so I don't handle phone calls. But feel free to chat with me here anytime!",
    };
  }
  if (checkForKeywords(lowercaseMessage, privacyQuestions.email)) {
    return {
      message:
        "I don't have an email address, but you can always reach out to support for further assistance!",
    };
  }
  if (checkForKeywords(lowercaseMessage, privacyQuestions.socialMedia)) {
    return {
      message:
        "I'm not on social media, but you can always chat with me here for any questions or assistance.",
    };
  }
  if (checkForKeywords(lowercaseMessage, privacyQuestions.phone)) {
    return {
      message:
        "I don't have a phone number, but feel free to ask me anything here!",
    };
  }

  // Handle specific introductions
  if (lowercaseMessage.startsWith("my name is")) {
    return {
      message: "My name is Addy, nice to meet you! How can I assist you today?",
    };
  }

  // Check for "How do I invite people?"

  // General help with support or issue reporting
  if (
    lowercaseMessage.includes("i have an issue") ||
    lowercaseMessage.includes("i have a problem") ||
    lowercaseMessage.includes("i have a challenge")
  ) {
    return {
      message:
        "I'm sorry you're facing an issue. Could you provide more details so I can help? If necessary, I can also open a support ticket for you.",
      askToOpenTicket: true,
    };
  }

  // Handle greetings, help, balance inquiries, and task lists
  if (responses.greetings.some((word) => lowercaseMessage.includes(word))) {
    return { message: "Hello! How can I assist you?" };
  }
  if (responses.help.some((word) => lowercaseMessage.includes(word))) {
    return {
      message: "Sure, I’m here to help! What do you need assistance with?",
    };
  }

  // Check for spell checking if not already checked
  if (!isSpellChecked) {
    lowercaseMessage = await spellCheck(lowercaseMessage);
    isSpellChecked = true;
    isSuggestionSpellChecked = false;

    const botResponse = await generateBotResponse(
      lowercaseMessage,
      conversationState
    );

    return botResponse;
  }

  if (!isSuggestionSpellChecked) {
    // Run the suggestion spell check
    let response = suggestionSpellCheck(lowercaseMessage, dictionary);

    console.log("suggestionSpellCheck ran");
    isSuggestionSpellChecked = response.isSuggestion; // Mark that spell check has been performed

    console.log("suggestionresponse", response);

    // Check if there are suggestions
    if (response.isSuggestion) {
      return { message: response.message }; // Return the suggestion message if available
    }

    //If no suggestions were made, set lowercaseMessage to response message
    lowercaseMessage = response.message;
  }

  // If no match, save unanswered question
  await saveUnansweredQuestion(lowercaseMessage);
  return {
    message:
      "I'm sorry, I don't have an answer for that right now. I'll forward your question to the support team.",
    askToOpenTicket: false,
  };
};

////Function to match user input with FAQ
// const matchFAQ = (userMessage) => {
//   const lowercaseMessage = userMessage.toLowerCase().trim();
//   const faqQuestions = faqData.map((faq) => faq.question.toLowerCase());
//   const matches = stringSimilarity.findBestMatch(
//     lowercaseMessage,
//     faqQuestions
//   );
//   const bestMatch = matches.bestMatch;

//   if (bestMatch.rating > 0.6) {
//     const matchedFAQ = faqData[matches.bestMatchIndex];
//     return matchedFAQ.answer;
//   }
//   return null; // No match found
// };

//// Function to match user input with FAQ
// Function to match user input with FAQ
const matchFAQ = (userMessage) => {
  const lowercaseMessage = userMessage.toLowerCase().trim(); // Normalize user input
  let bestMatch = null; // Variable to store the best matching FAQ
  let highestRating = 0; // Variable to track the highest similarity rating

  // Normalize questions for a given FAQ entry
  const normalizeQuestions = (faq) => {
    return Array.isArray(faq.question) ? faq.question : [faq.question];
  };

  // Iterate through each FAQ entry
  for (const faq of faqData) {
    // Ensure the question exists
    if (!faq.question) {
      console.warn("Skipping FAQ entry without a question:", faq);
      continue; // Skip this entry if there is no question
    }

    // Get the normalized questions
    const questions = normalizeQuestions(faq);

    // Check each question for a match
    for (const question of questions) {
      // Ensure the question is a string
      if (typeof question !== "string") {
        console.warn("Invalid question format:", question);
        continue; // Skip invalid question formats
      }

      const lowerCaseQuestion = question.toLowerCase(); // Normalize the question
      const match = stringSimilarity.compareTwoStrings(
        lowercaseMessage,
        lowerCaseQuestion
      ); // Calculate similarity

      // Update best match if the current match is higher than the previous highest
      if (match > highestRating) {
        highestRating = match;
        bestMatch = faq;
      }
    }
  }

  // Return the answer if the best match rating is above the threshold
  if (highestRating > 0.6) {
    console.log("bestMatch.answer", bestMatch.answer);
    return bestMatch.answer;
  }

  return null; // No match found
};

// Function to save unanswered questions to the database
const saveUnansweredQuestion = async (message, userId = null) => {
  try {
    await UnansweredQuestion.create({
      question: message,
      userId: userId,
    });
    console.log(`Unanswered question saved to database: ${message}`);
  } catch (error) {
    console.error("Error saving unanswered question to database:", error);
  }
};

//   // Function to remove duplicates from the corrections object
//   const removeDuplicates = (obj) => {
//     const uniqueEntries = {};
//     for (const [key, value] of Object.entries(obj)) {
//       if (!uniqueEntries[key]) {
//         uniqueEntries[key] = value; // Add to uniqueEntries if key doesn't exist
//       }
//     }
//     return uniqueEntries;
//   };

//   // Remove duplicates from the corrections object
// const uniqueCorrections = removeDuplicates(corrections);
//   console.log("Unique Corrections:", uniqueCorrections);

import { useContext, useEffect } from "react";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import { useNavigate } from "react-router-dom";
import MineHelmet from "../MineHelmet";

const MineFAQ = () => {
  const {
    isLoggedIn,
    setPageTitle,
    APP_NAME  // Added a fallback for APP_NAME
  } = useContext(AuthContext);

  const { SERVICENAME } = useContext(MineContext);
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Redirect user if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  // Set the page title on component mount
  useEffect(() => {
    setPageTitle("FAQ");
  }, [setPageTitle]);



  return (
    <>
      <MineHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} mining FAQ page, where you get our frequently asked questions`}
        pageName="addymine/faq"
        pageTitle={`${APP_NAME} - Mining FAQ`}
      />
      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <ol className="w-full flex-grow min-h-16 flex-col flex justify-center items-left rounded-md list-decimal">
            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    How to mine shares?
                  </b>
                </summary>

                <p>
                  To use this service or start mining shares, follow these
                  steps:
                </p>
                <ol className="list-decimal list-inside">
                  <li>Create an Account – Sign up to get started.</li>
                  <li>Log In – Access your account using your credentials.</li>
                  <li>
                    {`Select ${SERVICENAME} Service – Choose the "${SERVICENAME}" option on
                    the homepage.`}
                  </li>
                  <li>
                    Scroll Down – Go down a bit to locate the tasks section.
                  </li>
                  <li>
                    Click 'Go to Tasks' – This will bring you to the list of
                    available tasks.
                  </li>
                  <li>
                    Choose a Task – Each task comes with its own set of
                    instructions.
                  </li>
                  <li>
                    Complete Tasks – Work on as many tasks as you can to
                    maximize your rewards.
                  </li>
                </ol>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    Why should I refer people?
                  </b>
                </summary>
                <ol className="list-decimal list-inside">
                  <li>
                    You should refer people because the more your referrals
                    mine, the more shares you earn. You will receive a 10% bonus
                    of the shares they mine each day.
                  </li>
                  <li>
                    With more people mining, our content gets more engagement
                    and views, making it more likely to be recommended to
                    others, increasing the value of our shares.
                  </li>
                  <li>
                    Having more members opens opportunities for internal
                    advertisements and more revenue, thereby increasing the unit
                    value of our shares.
                  </li>
                </ol>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    How can we pay all these people?
                  </b>
                </summary>
                <p>
                  The total shares of the previous month are valued, and you get
                  paid based on the unit share value multiplied by your total
                  shares from the last month. What you make is what you get.
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    How do you get paid?
                  </b>
                </summary>
                <p>
                  Payouts are automated, ensuring a fast process. Data integrity
                  has been prioritized, so there's no need for manual review
                  before processing your withdrawal.
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    How do we make the money?
                  </b>
                </summary>
                <p>
                  We generate revenue through:
                  <ol className="list-decimal list-inside">
                    <li>Ads triggered on our social platforms</li>
                    <li>Internally generated campaigns</li>
                    <li>Sponsorships</li>
                  </ol>
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    Are we really getting paid?
                  </b>
                </summary>
                <p>
                  Yes, all our activities are aimed at generating revenue. As
                  long as we make money, we get paid.
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    When do payments start?
                  </b>
                </summary>
                <p>Payments start once we are monetized.</p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    How much is a share worth?
                  </b>
                </summary>
                <p>
                  A share is worth 50% to 60% of the total monthly revenue,
                  divided by the total shares mined for that month. This can
                  result in a significant amount.
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    What is the minimum withdrawal amount?
                  </b>
                </summary>
                <p>
                  The minimum withdrawal amount is 2 USD plus transaction
                  charge. The charge is the cost of withdrawal from third party
                  app.
                </p>
              </details>
            </li>

            <li className="bg-[var(--container-bg-color)] rounded-md mb-4 p-4">
              <details>
                <summary className="cursor-pointer">
                  <b className="text-[var(--accent-color)]">
                    What happens if I don’t complete my daily task?
                  </b>
                </summary>
                <p>
                  If you don’t complete your daily task, you lose your referral
                  bonus for that day to {APP_NAME}.
                </p>
              </details>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
};

export default MineFAQ;

import{r as s,A as S,u as A,j as e,L as b}from"./index-CjYO5HdS.js";import{S as n}from"./sweetalert2.esm.all-BGf-Fe8G.js";import{A as T}from"./AuthHelmet-EAF1nPXA.js";import{B as C}from"./BeatLoader-Cw3v0UOt.js";import"./Helmet-DlaOlHX7.js";const U=()=>{const{API_base_url:c,handleAlreadyLoggedIn:d,StoreToken:y,StoreUserObj:w,SetReferalId:j,logout:N,setPageTitle:m,APP_NAME:f}=s.useContext(S),[g,h]=s.useState(!1),[l,k]=s.useState({email:"",password:""});s.useEffect(()=>(m(""),()=>{}),[m]);const u=new URLSearchParams(window.location.search),p=u.get("refId");p&&j(p);async function E(){const a=u.get("verify");if(console.log("VerificationToken",a),a)try{let r=`${c}api/a/v1.00/users/verifyemail/${a}`;console.log("VerifyURL",r);const o=await fetch(r,{method:"GET",headers:{"Content-Type":"application/json"}}),i=await o.json();return o.ok?(console.log("Email verified successfully!",i),n.fire("Email verified successfully! Please login"),N(),t("/"),i):(console.error("Failed to verify email:",i.message||i),n.fire({icon:"error",title:"Email Verification Failed!",html:`
              Possible expired token.<br> 
              Please log in and resend email verification to proceed.
            `,confirmButtonText:"Okay"}),t("/"),null)}catch(r){return console.error("An error occurred while verifying the email:",r),n.fire("An error occurred while verifying the email: "+r.message),null}}E();const t=A();s.useEffect(()=>{d()&&t("/in/home")},[d,t]);const[x,L]=s.useState(""),v=a=>{k({...l,[a.target.name]:a.target.value})},P=async a=>{a.preventDefault(),h(!0);try{console.log("formData",l);const r=await fetch(`${c}api/a/v1.00/users/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}),o=await r.json();if(r.ok)o.token&&y(o.token),o.data&&w(o.data),console.log("User ",o.data),o.data.role.includes("user")?t("/in/home"):t("/");else throw Error(`${o.message}`)}catch(r){console.error(`Error during login: ${r}`),L(`${r}...`)}h(!1)};return e.jsxs(e.Fragment,{children:[e.jsx(T,{pageDescription:`Welcome to ${f.toLowerCase()}, your go-to platform for smart solutions.`,pageName:"login",pageTitle:`${f} - Login`}),e.jsxs("div",{className:"container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg",children:[e.jsx("div",{className:" formHeader mb-6 rounded-md",children:e.jsx("h1",{className:"text-2xl font-bold text-[var(--primary-text-color)] text-center",children:"Login"})}),e.jsxs("form",{children:[x&&e.jsx("div",{className:"error-message",children:x}),e.jsx("label",{className:"block mb-2 text-[var(--primary-text-color)] font-bold",htmlFor:"email",children:"Email"}),e.jsx("input",{type:"email",name:"email",placeholder:"Email",value:l.email,onChange:v,id:"email",className:"mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"}),e.jsx("label",{className:"block mb-2 text-[var(--primary-text-color)] font-bold",htmlFor:"password",children:"Password"}),e.jsx("input",{type:"password",name:"password",placeholder:"Password",value:l.password,onChange:v,id:"password",className:"mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"}),e.jsx("button",{onClick:P,type:"submit",className:"w-full mt-7 py-2 bg-[var(--highlight-color)] text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300",children:g?e.jsx(C,{color:"#ffffff",loading:g,size:8}):"Login"})]}),e.jsxs("div",{className:"mt-6 flex justify-between bg",children:[e.jsx(b,{to:"/forgotpass",className:"text-[var(--accent-color)] hover:text-[var(--highlight-color)]",children:"Forgot Password?"}),e.jsx(b,{to:"/register",className:"text-[var(--accent-color)] hover:text-[var(--highlight-color)]",children:"Register"})]})]})]})};export{U as default};
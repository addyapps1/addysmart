import{r as s,A as T,u as A,j as e}from"./index-kR-aReZW.js";import{M as B}from"./AddyMine-D2d0Guu5.js";import{T as I,W as U}from"./WatchcodeModal-DKTa-d-V.js";import{S as b}from"./sweetalert2.esm.all-BGf-Fe8G.js";import{B as L}from"./BeatLoader-14DkuQDB.js";import"./useClickOutside-DlfaV4Ao.js";import"./line-md--menu-to-close-transition-CEm-3zyw.js";const q=()=>{var x,u,g;const{logout:h,isLoggedIn:n,getStoredUserObj:i,getStoredToken:j,setPageTitle:l}=s.useContext(T),{API_MineBase_url:v,tasks:c,setTasks:w,balance:$,setBalance:k}=s.useContext(B),[f,d]=s.useState(!1),[o,N]=s.useState({}),[C,m]=s.useState(null),[M,p]=s.useState(!1),r=A();s.useEffect(()=>{n()||r("/")},[n,r]),s.useEffect(()=>(l("MAMAGEBALANCE"),()=>{}),[l]),s.useEffect(()=>{N(i())},[i]);const E=async()=>{d(!0);try{const t=`${v()}api/a/v1.00/evideo/tasks`,a=await(await fetch(t,{method:"GET",headers:{"Content-Type":"application/json",authorization:`Bearer ${j()}`}})).json();if(a.status==="success"&&a.data)w(a.data);else throw new Error(a.message)}catch(t){t=="Error: jwt expired"&&(b.fire("Your login expired, please login again."),h(),r("/")),console.error("Request failed:",t)}finally{d(!1)}};s.useEffect(()=>{E()},[]);const y=t=>{m(t),p(!0)},S=()=>{p(!1),m(null)};return e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"flex justify-center items-center mx-6 mb-6 mt-10",children:e.jsx("div",{className:"cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6",children:e.jsxs("div",{className:"bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md",children:[e.jsx("h1",{className:"w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl",children:`${((x=o.userTitle)==null?void 0:x.toUpperCase())||"ff"} 
              ${((u=o.firstName)==null?void 0:u.toUpperCase())||"ff"} 
              ${((g=o.lastName)==null?void 0:g.toUpperCase())||"ff"}`}),e.jsxs("p",{className:"w-full text-center mb-2 px-3",children:["Mine real shares and get paid every month"," "]})]})})}),f?e.jsx("div",{className:"flex justify-center items-center mt-10",children:e.jsx(L,{color:"#ffffff",loading:f,size:8})}):c.length>0?c.map(t=>e.jsx("div",{className:"task-item",children:e.jsx(I,{title:t.title,description:t.description,image:t.image,onWatchCodeClick:()=>y(t.videoId)})},t._id)):e.jsx("p",{className:"text-center",children:"No record yet."}),e.jsx(U,{videoId:C,isOpen:M,onClose:S})]})};export{q as default};
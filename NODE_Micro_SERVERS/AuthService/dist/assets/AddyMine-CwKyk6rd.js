function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/MiningServiceHeader-BV2RESx2.js","assets/index-DWis4S1t.js","assets/index-CQ4DyxKU.css","assets/MineHome-DtOg536v.js","assets/Tasks-D1-0mpNd.js","assets/WatchcodeModal-Ch7SbnCH.js","assets/sweetalert2.esm.all-BGf-Fe8G.js","assets/BeatLoader-CfJHUm3g.js","assets/ManageTasks-BhwEv9Am.js","assets/ManageBalance-CSWioWgj.js","assets/Referrals-DBUehRki.js","assets/Support-KpMW25Ff.js","assets/MineFAQ-CVr5m8Hn.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{r as t,P as N,j as e,A as M,u as w,L as a,_ as o,R as I,a as r,$ as S}from"./index-DWis4S1t.js";const k=t.createContext(null),A=x=>{const{children:p}=x;let n,l,m;console.log("import.meta.env.MODE","production"),console.log("Case2"),n="https://addysmart-miningservice.onrender.com/",console.log("API_MineBase_url",n),l="https://addysmart-authservice.onrender.com/",m="https://addysmart-e-videoservice.onrender.com/";const[i,c]=t.useState([]),[h,s]=t.useState({}),[g,u]=t.useState(!1),v={API_MineBase_url:n,API_AuthBase_url:l,API_E_VideoBase_url:m,tasks:i,setTasks:c,balance:h,setBalance:s,isOpen:g,setIsOpen:u,toggleSidebar:()=>{u(!g)}};return e.jsx(k.Provider,{value:v,children:p})};A.propTypes={children:N.node.isRequired};const T="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1em'%20height='1em'%20viewBox='0%200%2024%2024'%3e%3cg%20fill='none'%20stroke='goldenrod'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='2'%3e%3cpath%20d='M18%2020a6%206%200%200%200-12%200'/%3e%3ccircle%20cx='12'%20cy='10'%20r='4'/%3e%3ccircle%20cx='12'%20cy='12'%20r='10'/%3e%3c/g%3e%3c/svg%3e",L=()=>{var j,f,b;const{getStoredUserObj:x,isLoggedIn:p,logout:n,profileImagePath:l}=t.useContext(M),{isOpen:m}=t.useContext(k),i=w(),[c,h]=t.useState(()=>localStorage.getItem("sidebarAlignment")||"right"),[s,g]=t.useState({});t.useEffect(()=>{g(x())},[x]);const u=d=>{d.preventDefault(),n(),i("/")};let _=T;l()!==void 0&&(_=l());const v=d=>{const y=d.target.value;h(y),localStorage.setItem("sidebarAlignment",y)},P=d=>{d.preventDefault(),p()?i("/home"):i("/")},E=c==="left"?"left-0":"right-0";return e.jsx(e.Fragment,{children:e.jsxs("div",{className:`fixed top-0 ${E} pt-[100px] flex flex-col h-full bg-[var(--background-color-scondary)] text-white w-64 py-7 px-2 z-99 transform ${m?"translate-x-0":c==="left"?"-translate-x-full":"translate-x-full"} transition-transform duration-300 ease-in-out`,children:[e.jsxs("div",{children:[e.jsx("img",{onClick:P,src:_,alt:"profileImage",className:"pagelogo w-10 aspect-square rounded-full mx-auto",title:"back to addysmart"}),e.jsx("h1",{className:"w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl",children:`${((j=s.userTitle)==null?void 0:j.toUpperCase())||""} 
              ${((f=s.firstName)==null?void 0:f.toUpperCase())||""} 
              ${((b=s.lastName)==null?void 0:b.toUpperCase())||""}`})]}),e.jsxs("nav",{className:"rounded max-h-[35vh] overflow-y-auto",children:[e.jsx(a,{to:"/home",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"Home"}),e.jsx(a,{to:"./",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"Dashboard"}),e.jsx(a,{to:"./tasks",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"Tasks"}),s&&s.role&&s.role.includes("superAdmin")&&e.jsx(a,{to:"./managetasks",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"ManageTask"}),e.jsx(a,{to:"./managebalance",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"ManageBalance"}),e.jsx(a,{to:"./referrals",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"Referrals"}),e.jsx(a,{to:"./support",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"Support"}),e.jsx(a,{to:"./faq",className:"block py-2.5 px-4 rounded hover:bg-gray-700",children:"FAQ"})]}),e.jsxs("div",{className:"mt-4 flex flex-col",children:[e.jsx("label",{htmlFor:"alignment",className:"mr-2 text-white",children:"Sidebar Alignment:"}),e.jsxs("select",{id:"alignment",value:c,onChange:v,className:"px-2 py-1 rounded bg-gray-200 text-black",children:[e.jsx("option",{value:"right",children:"Right"}),e.jsx("option",{value:"left",children:"Left"})]})]}),e.jsx("div",{className:"absolute bottom-4 left-0 w-full m-0 p-0 flex",children:e.jsx("button",{onClick:u,className:"w-full bg-[var(--accent-color] text-white p-2 m-2 rounded hover:text-highlight-colortransition-colors",children:"Logout"})})]})})},R=t.lazy(()=>o(()=>import("./MiningServiceHeader-BV2RESx2.js"),__vite__mapDeps([0,1,2]))),C=t.lazy(()=>o(()=>import("./MineHome-DtOg536v.js"),__vite__mapDeps([3,1,2]))),O=t.lazy(()=>o(()=>import("./Tasks-D1-0mpNd.js"),__vite__mapDeps([4,1,2,5,6,7]))),D=t.lazy(()=>o(()=>import("./ManageTasks-BhwEv9Am.js"),__vite__mapDeps([8,1,2,7,6]))),z=t.lazy(()=>o(()=>import("./ManageBalance-CSWioWgj.js"),__vite__mapDeps([9,1,2,5,6,7]))),V=t.lazy(()=>o(()=>import("./Referrals-DBUehRki.js"),__vite__mapDeps([10,1,2,5,6,7]))),$=t.lazy(()=>o(()=>import("./Support-KpMW25Ff.js"),__vite__mapDeps([11,1,2]))),B=t.lazy(()=>o(()=>import("./MineFAQ-CVr5m8Hn.js"),__vite__mapDeps([12,1,2]))),U=()=>e.jsx("div",{className:"flex justify-center items-center h-screen",children:e.jsx(S,{height:100,width:100,color:"#4fa94d",ariaLabel:"loading-indicator"})}),q=()=>e.jsx(A,{children:e.jsxs(t.Suspense,{fallback:e.jsx(U,{}),children:[e.jsx(R,{}),e.jsx(L,{}),e.jsx("main",{children:e.jsxs(I,{children:[e.jsx(r,{path:"/support",element:e.jsx($,{})}),e.jsx(r,{path:"/referrals",element:e.jsx(V,{})}),e.jsx(r,{path:"/managebalance",element:e.jsx(z,{})}),e.jsx(r,{path:"/managetasks",element:e.jsx(D,{})}),e.jsx(r,{path:"/faq",element:e.jsx(B,{})}),e.jsx(r,{path:"/tasks",element:e.jsx(O,{})}),e.jsx(r,{path:"/*",element:e.jsx(C,{})})]})})]})}),H=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"}));export{H as A,k as M};
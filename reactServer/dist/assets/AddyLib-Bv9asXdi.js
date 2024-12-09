function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/LibraryServiceHeader-Cij0MCq6.js","assets/index-BDQ6Dlko.js","assets/index-aU5bFbZ-.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{r as s,_ as r,j as e,R as i,$ as a}from"./index-BDQ6Dlko.js";const t=s.lazy(()=>r(()=>import("./LibraryServiceHeader-Cij0MCq6.js"),__vite__mapDeps([0,1,2]))),n=()=>e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(a,{height:100,width:100,color:"#4fa94d",ariaLabel:"loading-indicator"})}),c=()=>e.jsxs(e.Fragment,{children:[e.jsx(t,{}),e.jsxs("main",{children:[e.jsx("section",{className:"flex justify-center items-center mx-6 mb-14",children:e.jsx("div",{className:"cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6",children:e.jsx("div",{className:"bg-[var(--container-bg-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md",children:"This service is still under development"})})}),e.jsx(s.Suspense,{fallback:e.jsx(n,{}),children:e.jsx(i,{})})]})]});export{c as default};

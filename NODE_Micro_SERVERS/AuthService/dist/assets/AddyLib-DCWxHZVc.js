function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/LibraryServiceHeader-_jL5EZGy.js","assets/index-DWis4S1t.js","assets/index-CQ4DyxKU.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{r as s,_ as r,j as e,R as a,$ as i}from"./index-DWis4S1t.js";const t=s.lazy(()=>r(()=>import("./LibraryServiceHeader-_jL5EZGy.js"),__vite__mapDeps([0,1,2]))),d=()=>e.jsx("div",{className:"flex justify-center items-center h-full",children:e.jsx(i,{height:100,width:100,color:"#4fa94d",ariaLabel:"loading-indicator"})}),o=()=>e.jsxs(e.Fragment,{children:[e.jsx(t,{}),e.jsxs("main",{children:[e.jsx("div",{children:"AddyLib"}),e.jsx(s.Suspense,{fallback:e.jsx(d,{}),children:e.jsx(a,{})})]})]});export{o as default};

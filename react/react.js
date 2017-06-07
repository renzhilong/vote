var ReactDOM = {
  render(element, container){
    container.appendChild(element);
  }
}

function createDOM(str) {
  let div = document.createElement('div');
  div.innerHTML = str;
  div.onStateChange = (oldEle,newEle)=>{
    div.parentNode.insertBefore(newEle,oldEle);
    div.parentNode.removeChild(oldEle);
  }
  return div;
}

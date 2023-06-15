const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
  yValue = 0; /*tracking image displacement*/

window.addEventListener("mousemove", (e) => {
  xValue = e.clientX - window.innerWidth / 2; /*event object*/
  yValue = e.clientY - window.innerHeight / 2; /*getting centre position*/
  let zValue = 100;
  /*mouse is now relative to the centre of the screen*/
  console.log(xValue, yValue); /*shows mouse coordinates*/

  parallax_el.forEach((el) => {
    let speedx = el.dataset.speedx;
    let speedy = el.dataset.speedy;

    
    let zValue = e.clientX - parseFloat(getComputedStyle(el).left) ;


    el.style.transform = `translateX(calc(-50% + ${-xValue * speedx}px)) translateY(calc(-50% + ${yValue *speedy}px)) perspective(2300px) translateZ(${zValue}px)`;
  });
});

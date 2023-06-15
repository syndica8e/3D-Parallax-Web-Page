const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
  yValue = 0; /*tracking image displacement*/

window.addEventListener("mousemove", (e) => {
  xValue = e.clientX - window.innerWidth / 2; /*event object*/
  yValue = e.clientY - window.innerHeight / 2; /*getting centre position*/
  /*mouse is now relative to the centre of the screen*/

  parallax_el.forEach((el) => {
    el.style.transform = `translateX(calc(-50% + ${xValue}px)) translateY(calc(-50% + ${yValue}px)`;
  });
});

const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
  yValue = 0; /*tracking image displacement*/

let rotateDegree = 0;

function update(cursorPosition) {
  parallax_el.forEach((el) => {
    let speedx = el.dataset.speedx;
    let speedy = el.dataset.speedy;
    let speedz = el.dataset.speedz;
    let rotateSpeed = el.dataset.rotation;

    let isInLeft =
      parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1;
    let zValue = (cursorPosition - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.1;

    el.style.transform = `translateX(calc(-50% + ${
      -xValue * speedx
    }px)) translateY(calc(-50% + ${
      yValue * speedy
    }px)) perspective(2300px) translateZ(${zValue * speedz}px) rotateY(${rotateDegree * rotateSpeed}deg)`;
  });
}

update(0);

window.addEventListener("mousemove", (e) => {
  xValue = e.clientX - window.innerWidth / 2; /*event object*/
  yValue = e.clientY - window.innerHeight / 2; /*getting centre position*/
  /*mouse is now relative to the centre of the screen*/
  console.log(xValue, yValue); /*shows mouse coordinates*/

  rotateDegree = (xValue / (window.innerWidth / 2)) * 20; //rotate value 0 to 20

  update(e.clientX);
});

/*GSAP Animations*/

let timeline = gsap.timeline();

timeline.from(".bg-img", {
  top: `${+document.querySelector(".bg-img").offsetHeight / 2 -200}px`,
  duration: 3.5,
})

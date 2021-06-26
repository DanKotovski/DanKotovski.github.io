let scene = document.querySelector('.scene');
let parallaxInstance = new Parallax(scene, {
    relativeInput: true,
    clipRelativeInput: true,
    frictionX: 0.1,
    frictionY: 0.1,
    limitX: 40,
    limitY: 30
});


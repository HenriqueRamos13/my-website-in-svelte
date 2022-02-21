<script lang="ts">
  import Contact from "./components/Contact.svelte";
  import Header from "./components/Header.svelte";
  import Section from "./components/Section.svelte";

  const STEPS = [
    {
      step: 1,
      stepTitle: "Bem vindo!",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Henrique Ramos, Web Developer",
      index: 0,
    },
    {
      step: 2,
      stepTitle: "Quem sou eu?",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Teste do Web Developer",
      index: 1,
    },
    {
      step: 3,
      stepTitle: "Trabalhos",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Uma nova seção",
      index: 2,
    },
    {
      step: 3,
      stepTitle: "Trabalhos",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Penultima seção",
      index: 3,
    },
    {
      step: 3,
      stepTitle: "Trabalhos",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Ultima seção",
      index: 4,
    },
    {
      step: 4,
      stepTitle: "Contato",
      src: "images/image1.webp",
      alt: "imagem",
      title: "Contato",
      index: 5,
      component: Contact,
    },
  ];

  var mouse_x;
  var mouse_y;
  let currentStep: number = 0;

  type Step = {
    step: number;
    stepTitle: string;
    src: string;
    alt: string;
    title: string;
    index: number;
    component?: any;
  };

  function debounce(func: Function, wait: number, immediate: boolean = false) {
    let timeout;

    return function (...t) {
      const context = this,
        d = immediate && !timeout;
      clearTimeout(timeout),
        (timeout = setTimeout(function () {
          (timeout = null), immediate || func.apply(context, t);
        }, wait)),
        d && func.apply(context, t);
    };
  }

  function moveSections(direction: number) {
    // Direction = -1 === Up
    // Direction = 1 === Down
    if (currentStep + direction < 0) {
      return;
    } else if (currentStep + direction > steps.length - 1) {
      return;
    } else {
      currentStep = currentStep + direction;
    }

    if (direction === 1) {
      steps = [
        ...steps.map((step: Step) => ({
          ...step,
          index: step.index - 1,
        })),
      ];
    } else {
      steps = [
        ...steps.map((step: Step) => ({
          ...step,
          index: step.index + 1,
        })),
      ];
    }
  }

  function mouseWheel(e) {
    var direction = e.deltaY > 0 ? 1 : -1;
    moveSections(direction);
  }

  function verify(e) {
    var wheelDeltaY = e.wheelDeltaY;
    if (!wheelDeltaY) {
      var new_mouse_y = e.changedTouches[0].pageY || e.pageY;
      if (new_mouse_y - mouse_y > 75) {
        wheelDeltaY = 1;
      } else if (new_mouse_y - mouse_y < -75) {
        wheelDeltaY = -1;
      }
      moveSections(wheelDeltaY);
    }
  }

  function get_mouse_coords(e) {
    mouse_x = e.pageX;
    mouse_y = e.changedTouches[0].pageY || e.pageY;
  }

  window.addEventListener("touchstart", get_mouse_coords, false);
  window.addEventListener(
    "touchmove",
    debounce((e) => verify(e), 500)
  );

  window.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 640) {
      return;
    }

    var obg: HTMLDivElement = document.querySelector(".object");
    var cur: HTMLDivElement = document.querySelector(".cursor");
    cur.style.left = e.pageX + "px";
    cur.style.top = e.pageY + "px";
    setTimeout(() => {
      obg.style.left = e.pageX + "px";
      obg.style.top = e.pageY + "px";
    }, 50);
  });

  window.addEventListener(
    "mousewheel",
    debounce((e) => mouseWheel(e), 300)
  );

  window.addEventListener("keydown", (e) => {
    e.key === "ArrowDown" && debounce(() => moveSections(1), 300)();
    e.key === "ArrowUp" && debounce(() => moveSections(-1), 300)();
  });

  let steps: Step[] = STEPS;

  function goTo(index: number) {
    console.log("New index: ", index);
    currentStep = index;
    steps = STEPS.map((step: Step) => ({
      ...step,
      index: step.index - index,
    }));
  }
</script>

<main>
  <Header {goTo} />
  <div class="indicator">
    <div class="line" />
    <p class="title">
      {steps[currentStep].stepTitle}
    </p>
  </div>
  <div class="step">
    {steps[currentStep].step} / 4
  </div>
  <div class="object" />
  <div class="cursor" />
  <div class="sections">
    {#each steps as section}
      {#if !!section.component}
        <svelte:component
          this={section.component}
          last={section.index === -1}
          index={section.index}
        />
      {:else}
        <Section
          src={section.src}
          alt={section.alt}
          title={section.title}
          center={section.index === 0}
          last={section.index === -1}
          index={section.index}
        />
      {/if}
    {/each}
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 0.5rem;
    margin: 0 auto;
  }

  .indicator {
    display: none;
    position: fixed;
    transform: rotate(-90deg);
    min-width: 200px;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    bottom: 6rem;
    left: -4rem;
  }

  .indicator .line {
    display: none;
    flex: 1;
    height: 1px;
    margin-right: 0.5rem;
    background: #ffffff85;
  }

  .indicator .title {
    display: none;
    font-size: 1.3rem;
    font-weight: bold;
    color: #ffffff85;
  }

  .step {
    display: none;
    position: fixed;
    top: 50vh;
    left: 0.8rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff85;
  }

  .sections {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  @media (min-width: 640px) {
    .indicator {
      left: -3rem;
      display: flex;
    }

    .step {
      left: 2rem;
      display: block;
    }

    .indicator .line {
      display: block;
    }

    .indicator .title {
      display: block;
    }
  }

  @media (min-width: 834px) {
    .indicator {
      left: -3rem;
      display: flex;
    }

    .step {
      left: 2rem;
      display: block;
    }
  }

  .object {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    top: -100px;
    left: -100px;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgb(131, 5, 143);
    border: 1px solid rgb(131, 5, 143);
  }

  .cursor {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    top: -100px;
    left: -100px;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: lightgray;
  }
</style>

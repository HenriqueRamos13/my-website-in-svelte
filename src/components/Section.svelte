<script lang="ts">
  export let title: string;
  export let src: string;
  export let alt: string;
  export let center: boolean;
  export let last: boolean;
  export let index: number;

  let zoom: boolean = false;

  function handleMouseEnter() {
    center && (zoom = true);
  }

  function handleMouseLeave() {
    center && (zoom = false);
  }
</script>

<section style={`margin-top: ${last ? "-48vh" : `${index * 45}vh`};`}>
  <div class="unify" style={`display: ${last || index <= 1 ? "flex" : "none"}`}>
    <h2
      class={`
        title title-white
        ${zoom ? "zoom zoom-text" : ""} 
        ${center ? "" : "no-center opacity-0"}
      `}
    >
      {title}
    </h2>

    <h2
      class={`
        title title-empty 
        ${zoom ? "zoom zoom-text" : ""} 
        ${center ? "" : "no-center"}
      `}
    >
      {title}
    </h2>
  </div>
  <img
    class={`
      ${zoom ? "zoom zoom-image" : ""} 
      ${center ? "not-skewed" : "skewed"}
    `}
    {src}
    {alt}
  />
</section>

<!-- on:mouseenter={handleMouseEnter}
on:mouseleave={handleMouseLeave} -->
<style>
  section {
    min-width: 300px;
    width: 90vw;
    position: absolute;
    height: 100vh;
    transition: all 1s ease-in-out;
  }

  img {
    width: 70%;
    min-width: 280px;
    height: 30%;
    position: fixed;
    bottom: 0;
    top: 35%;
    right: 5%;
  }

  .skewed {
    /* transform: perspective(1200px) translateZ(0px) translateX(0px)
      translateY(0px) rotateY(-15deg);
    transform-origin: right; */
    transition: all 0.5s ease-in-out;
    opacity: 0;
    z-index: 1;
  }

  .not-skewed {
    transform: none;
    transition: all 0.5s;
    transition-delay: 1s;
    opacity: 1;
  }

  .unify {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .title {
    max-width: 70%;
    font-size: 1.7rem;
    font-weight: bold;
    text-transform: uppercase;
    margin: 0;
    position: absolute;
    left: 0;
    top: 45%;
    transition: all 0.5s;
    text-align: left;
  }

  .title-empty {
    -webkit-text-stroke: 1px white;
    color: transparent;
    z-index: 2;
  }

  .title-white {
    color: white;
  }

  .no-center {
    font-size: 1.4em;
    left: 7%;
  }

  .zoom {
    transition: all 0.4s;
  }

  .opacity-0 {
    opacity: 0;
  }

  @media (min-width: 640px) {
    img {
      width: 60%;
      height: 40%;
      top: 30%;
    }

    .title {
      font-size: 2.5rem;
      left: 15%;
    }

    .no-center {
      font-size: 2em;
      left: 7%;
    }

    .title-empty {
      -webkit-text-stroke: 2px white;
    }

    .zoom-image {
      width: 65%;
      height: 45%;
      bottom: -5%;
    }

    .zoom-text {
      transform: scale(1.05);
      top: 45%;
    }
  }

  @media (min-width: 834px) {
    section {
      max-width: 1920px;
    }

    img {
      width: 60%;
      height: 50%;
      top: 25%;
    }

    .title {
      font-size: 4rem;
      left: 15%;
    }

    .title-empty {
      -webkit-text-stroke: 2px white;
    }

    .no-center {
      font-size: 3.5em;
      left: 7%;
      -webkit-text-stroke: 2px #ffffff45;
    }

    .zoom-image {
      width: 65%;
      height: 55%;
      bottom: -5%;
    }

    .zoom-text {
      transform: scale(1.05);
      top: 43%;
    }
  }
</style>

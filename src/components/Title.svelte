<script lang="ts">
  export let title: string;
  export let center: boolean;
  export let last: boolean;
  export let index: number;

  export let zoom: boolean = false;

  // function handleMouseEnter() {
  //   center && (zoom = true);
  // }

  // function handleMouseLeave() {
  //   center && (zoom = false);
  // }
</script>

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

<!-- on:mouseenter={handleMouseEnter}
on:mouseleave={handleMouseLeave} -->
<style>
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

    .zoom-text {
      transform: scale(1.05);
      top: 45%;
    }
  }

  @media (min-width: 834px) {
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

    .zoom-text {
      transform: scale(1.05);
      top: 43%;
    }
  }
</style>

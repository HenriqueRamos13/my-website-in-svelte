<script lang="ts">
  export let goTo: Function;
  let menus = [
    {
      name: "Home",
      index: 0,
    },
    {
      name: "Sobre",
      index: 1,
    },
    {
      name: "Portfolio",
      index: 2,
    },
    {
      name: "Contact",
      index: 5,
    },
  ];

  function beforeGoTo(index: number) {
    goTo(index);
  }
</script>

<nav>
  <ul>
    {#each menus as menu}
      <li>
        <button on:click={() => beforeGoTo(menu.index)}>
          <p>{menu.name}</p>
        </button>
      </li>
    {/each}
  </ul>
</nav>

<!-- on:mouseenter={handleMouseEnter}
on:mouseleave={handleMouseLeave} -->
<style>
  nav {
    z-index: 2;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  li {
    float: left;
    margin: 16px;
    height: 70px;
  }

  button {
    all: unset;
    border: none;
    background: none;
    color: #ffffff80;
  }

  button:hover,
  button:focus,
  button:active {
    all: unset;
    outline: none;
  }

  @media (min-width: 640px) {
  }

  @media (min-width: 834px) {
  }
</style>

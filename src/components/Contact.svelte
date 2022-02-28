<script lang="ts">
  import Title from "./Title.svelte";

  export let index: number;
  export let last: boolean;
  export let title: string;
  export let center: boolean;

  let zoom: boolean = false;
</script>

<section style={`margin-top: ${last ? "-48vh" : `${index * 45}vh`};`}>
  <Title {title} {zoom} {center} {index} {last} />
  <div class="cover">
    <div />
    <form style={`opacity: ${center ? 1 : 0};`} action="/action_page.php">
      <input type="text" id="fname" name="fname" placeholder="First name" />
      <input type="text" id="lname" name="lname" placeholder="E-mail" />
      <textarea placeholder="Type here..." />
      <button>Enviar</button>
    </form>
  </div>
</section>

<style>
  section {
    min-width: 300px;
    width: 90vw;
    position: absolute;
    height: 100vh;
    transition: all 1s ease-in-out;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .cover {
    position: absolute;
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  form {
    transition: all 1s ease-in-out;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  form > input {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid white;
    color: white;
    margin: 16px;
    width: 280px;
    padding: 8px;
    font-size: 0.9rem;
  }

  form > button {
    background-color: transparent;
    border: 1px solid white;
    color: white;
    padding: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    width: 280px;
    outline: none;
  }

  form > textarea {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid white;
    color: white;
    margin: 16px;
    width: 280px;
    padding: 8px;
    font-size: 0.9rem;
    resize: none;
    outline: none;
  }

  form > textarea::-webkit-scrollbar {
    width: 0.2em;
  }

  form > textarea::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    outline: 1px solid slategrey;
  }

  @media (min-width: 640px) {
    form > input {
      width: 320px;
    }

    form > button {
      width: 320px;
    }

    form > textarea {
      width: 320px;
    }
  }

  @media (min-width: 834px) {
    .cover {
      flex-direction: row;
      justify-content: space-around;
    }

    section {
      max-width: 1920px;
    }

    form > input {
      width: 430px;
    }

    form > button {
      width: 430px;
    }

    form > textarea {
      width: 430px;
    }
  }
</style>

<script lang="ts">
  export let index: number;
  export let last: boolean;
</script>

<section style={`margin-top: ${last ? "-48vh" : `${index * 45}vh`};`}>
  <div class="cover">
    <div />
    <h2>Contato</h2>
    <form action="/action_page.php">
      <label for="fname">First name:</label><br />
      <input type="text" id="fname" name="fname" value="John" /><br />
      <label for="lname">Last name:</label><br />
      <input type="text" id="lname" name="lname" value="Doe" /><br /><br />
      <input type="submit" value="Submit" />
    </form>
  </div>
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
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .cover {
    width: 90%;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  @media (min-width: 640px) {
  }

  @media (min-width: 834px) {
  }
</style>

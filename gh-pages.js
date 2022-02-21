var ghpages = require("gh-pages");

ghpages.publish(
  "public", // path to public directory
  {
    branch: "master",
    repo: "https://github.com/HenriqueRamos13/my-website-in-svelte", // Update to point to your repository
    user: {
      name: "HenriqueRamos13", // update to use your name
      email: "henrique.mrcr@gmail.com", // Update to use your email
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);

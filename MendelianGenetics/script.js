// Create the SVG element
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "600");
svg.setAttribute("height", "400");
svg.setAttribute("viewBox", "0 0 600 400");

// Append the SVG to the container div
document.getElementById("svgContainer").appendChild(svg);

// Define areas
const defaultArea = { x: 10, y: 10, width: 160, height: 200 };
const breedingArea = { x: 180, y: 10, width: 100, height: 100 };
const offspringArea = { x: 290, y: 10, width: 280, height: 380 };

// Gene pool
const genePools = [
  { chromosome: 1, alleles: ["Z", "z"] },
  { chromosome: 1, alleles: ["A", "A", "a", "a", "a"] },
  { chromosome: 2, alleles: ["B", "b"] },
  { chromosome: 2, alleles: ["C", "c"] },
  { chromosome: 3, alleles: ["D", "d"] },
  { chromosome: 4, alleles: ["X"] },
  { chromosome: 4, alleles: ["X", "Y"] }, // Example sex chromosomes
];

// Draw areas
function drawArea(area, className) {
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", area.x);
  rect.setAttribute("y", area.y);
  rect.setAttribute("width", area.width);
  rect.setAttribute("height", area.height);
  rect.setAttribute("fill", "white");
  rect.setAttribute("stroke", "black");
  rect.setAttribute("stroke-width", "2");
  rect.setAttribute("class", className);
  svg.appendChild(rect);
}

drawArea(defaultArea, "default-area");
drawArea(breedingArea, "breeding-area");
drawArea(offspringArea, "offspring-area");

// Function to get random allele from genePool
function getRandomAlleles(chromosomeNumber) {
  // 找到给定染色体编号的所有基因池
  const genePoolsForChromosome = genePools.filter(
    (pool) => pool.chromosome === chromosomeNumber
  );

  // 遍历每个基因池，并从中选择一个随机等位基因
  const alleles = genePoolsForChromosome.map((pool) => {
    return pool.alleles[Math.floor(Math.random() * pool.alleles.length)];
  });

  return alleles;
}

// Function to generate regular positions arranged in 2 columns
function getRegularPosition(index, total, maxWidth, maxHeight, columns) {
  //const columns = 2;
  const rows = Math.ceil(total / columns);
  const spacingX = maxWidth / (columns + 1);
  const spacingY = maxHeight / (rows + 1);

  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: (column + 1) * spacingX,
    y: (row + 1) * spacingY,
  };
}

// Create and add 6 sprites to the SVG with random alleles
const totalSprites = 8;

for (let i = 1; i <= totalSprites; i++) {
  const position = getRegularPosition(
    i - 1,
    totalSprites,
    defaultArea.width,
    defaultArea.height,
    2
  );
  /*
  const spriteChromosomes = [
    new Chromosome(1, [getRandomAllele()]),
    new Chromosome(1, [getRandomAllele()]),
  ];
  */

  const spriteChromosomes = [];
  for (let j = 1; j <= 3; j++) {
    // Add both chromosomes for each pair
    spriteChromosomes.push(new Chromosome(j, getRandomAlleles(j)));
    spriteChromosomes.push(new Chromosome(j, getRandomAlleles(j)));
  }
  spriteChromosomes.push(new Chromosome(4, getRandomAlleles(4)));

  new Sprite(
    `sprite${i}`,
    defaultArea.x + position.x,
    defaultArea.y + position.y,
    25,
    spriteChromosomes
  );
}

// Breeding function
let offspringCount = 0;

document.getElementById("breedButton").addEventListener("click", () => {
  const spritesInBreedingArea = [];
  svg.querySelectorAll(".sprite").forEach((sprite) => {
    const translateX = parseFloat(sprite.getAttribute("data-translateX"));
    const translateY = parseFloat(sprite.getAttribute("data-translateY"));

    if (!isNaN(translateX) && !isNaN(translateY)) {
      // Check if the sprite is within the breeding area bounds
      if (
        translateX > breedingArea.x &&
        translateX < breedingArea.x + breedingArea.width &&
        translateY > breedingArea.y &&
        translateY < breedingArea.y + breedingArea.height
      ) {
        spritesInBreedingArea.push(sprite);
      }
    } else {
      console.error("Invalid coordinates for sprite:", sprite);
    }
  });
  // 繁殖區有兩個個體
  if (spritesInBreedingArea.length === 2) {
    const parent1ChromosomesAttr =
      spritesInBreedingArea[0].getAttribute("data-chromosomes");
    const parent2ChromosomesAttr =
      spritesInBreedingArea[1].getAttribute("data-chromosomes");

    // Parse JSON string to get arrays of chromosome objects
    const parent1Chromosomes = JSON.parse(parent1ChromosomesAttr);
    const parent2Chromosomes = JSON.parse(parent2ChromosomesAttr);

    // Initialize offspring chromosomes array
    const offspringChromosomes = [];

    // Determine the maximum number of chromosomes between both parents
    const maxChromosomeNumber = Math.max(
      parent1Chromosomes.length,
      parent2Chromosomes.length
    );

    // Iterate through each chromosome number
    for (
      let chromosomeNumber = 1;
      chromosomeNumber <= maxChromosomeNumber;
      chromosomeNumber++
    ) {
      // Find all chromosomes from parent 1 with the current chromosome number
      const parent1MatchingChromosomes = parent1Chromosomes.filter(
        (chromosome) => chromosome.number === chromosomeNumber
      );

      // Find all chromosomes from parent 2 with the current chromosome number
      const parent2MatchingChromosomes = parent2Chromosomes.filter(
        (chromosome) => chromosome.number === chromosomeNumber
      );

      // Randomly select one chromosome from parent 1 if available
      if (parent1MatchingChromosomes.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * parent1MatchingChromosomes.length
        );
        offspringChromosomes.push(parent1MatchingChromosomes[randomIndex]);
      }
      // Randomly select one chromosome from parent 2 if available
      if (parent2MatchingChromosomes.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * parent2MatchingChromosomes.length
        );
        offspringChromosomes.push(parent2MatchingChromosomes[randomIndex]);
      }
    }

    // Determine position for the offspring sprite
    const position = getRegularPosition(
      offspringCount,
      32,
      offspringArea.width,
      offspringArea.height,
      4
    );

    // Create new offspring sprite with the generated chromosomes
    new Sprite(
      `offspring${offspringCount + 1}`,
      offspringArea.x + position.x,
      offspringArea.y + position.y,
      25,
      offspringChromosomes
    );

    offspringCount++;
  }
});

document.getElementById("deleteButton").addEventListener("click", () => {
  const spritesInOffspringArea = [];
  svg.querySelectorAll(".sprite").forEach((sprite) => {
    const translateX = parseFloat(sprite.getAttribute("data-translateX"));
    const translateY = parseFloat(sprite.getAttribute("data-translateY"));

    if (!isNaN(translateX) && !isNaN(translateY)) {
      // Check if the sprite is within the offspring area bounds
      if (
        translateX > offspringArea.x &&
        translateX < offspringArea.x + offspringArea.width &&
        translateY > offspringArea.y &&
        translateY < offspringArea.y + offspringArea.height
      ) {
        spritesInOffspringArea.push(sprite);
      }
    } else {
      console.error("Invalid coordinates for sprite:", sprite);
    }
  });

  // Remove sprites found in the offspring area
  spritesInOffspringArea.forEach((sprite) => {
    sprite.remove(); // Remove the sprite from the SVG
    // Optionally, perform any additional cleanup or logic here
  });
  offspringCount = 0;
});


// 獲取滑鼠/觸摸點擊位置的相對座標
function getMouseCoordinatesMoving(event, rect) {
    var mouseX, mouseY;
  
    if (event.type === "mousemove") {
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    } else if (event.type === "touchmove") {
      mouseX = event.touches[0].clientX - rect.left;
      mouseY = event.touches[0].clientY - rect.top;
    }
  
    return { mouseX, mouseY };
  }
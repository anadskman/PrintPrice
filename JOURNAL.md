# PrintPrice Journal

## 17/8/2026 - Built the full 3D print cost calculator

**Total Time**
**2h 55m**

I made PrintPrice, which is a calculator for finding the real cost of a 3D print.

I wanted to make this because most people only check how much filament a model uses when working out the cost. That leaves out electricity, printer wear, failed prints and the time spent setting up and finishing the print.

I also wanted it to give a suggested selling price instead of only showing the production cost.

### Starting the HTML

I started by making the full HTML structure.

I split the calculator into three main parts:

1. Information about the print
2. Printer and material costs
3. The final results

For the print information, I added filament weight, print hours, minutes and quantity.

For the costs, I added the spool price, spool weight, printer wattage, electricity price, printer price and expected lifetime. I also added labour time, hourly rate, failed print allowance and profit markup.

The results section included the suggested price, production cost, estimated profit and a breakdown for every cost.

At this point everything was on the page, but there was no styling yet. It was useful for checking that all of the inputs and text were there before spending time on the design.

![The first HTML version](images/01-html.png)

### Starting the design

I then started the CSS.

I made a basic colour system using CSS variables so I would not have to keep copying colour codes everywhere.

The main colours were:

* A light cream background
* Almost black text
* Orange for the main accent
* Dark blue for the results panel
* Light grey and beige borders

I first worked on the header and hero section. I added the PrintPrice name, a small logo made with CSS and the main heading.

I wanted it to look clean and related to 3D printing without using a large image. I made the orange shape on the right using several empty spans. They are stacked over each other to look a bit like layers from a 3D print.

![Starting the CSS](images/02-starting-css.png)

### Making the calculator layout

After the hero was mostly finished, I started styling the calculator itself.

The main calculator uses a grid with the inputs on the left and the results on the right. I made the results panel dark so it stood out from the rest of the page.

I grouped the inputs into:

* Your print
* Material
* Printer and power
* Time and risk

There were a lot of inputs, and the first versions looked crowded and uneven. Some of the labels and units were sitting directly beside each other instead of looking like proper fields.

I fixed this by giving each input its own bordered box and putting the units inside the right side of the box. I also used two and three-column grids to keep everything lined up.

![Building the calculator layout](images/03-calculator-layout.png)

I made the results panel stay beside the inputs on larger screens. It shows the suggested price at the top, followed by the production cost and estimated profit.

Under that, I added a cost breakdown for:

* Filament
* Electricity
* Machine wear
* Labour
* Failed prints

I added coloured bars so it is easy to see which part adds the most to the cost.

### Making it responsive

Once the desktop layout was working, I added media queries for smaller screens.

On a phone or narrow screen, the results panel moves underneath the inputs. The input grids also change to fewer columns so the fields do not become too narrow.

I hid the 3D layer decoration on smaller screens because it took up too much space and was not needed for the calculator to work.

### Adding the JavaScript

After the design was mostly finished, I started the JavaScript.

I made one object containing all of the default values. This made it easier to load the starting settings and reset the calculator later.

The calculator reads every input and works out:


Filament cost
Electricity cost
Machine wear
Labour cost
Failed print allowance
Production cost
Profit
Suggested selling price


I added an event listener to every input so the results update immediately when a value changes. There is no calculate button because I wanted it to feel instant.

I also used `Intl.NumberFormat` to show all money values properly in euros.

### Results stuck at €0.00

The main problem I had was that every result stayed at €0.00 even though all of the inputs had values.

At first I thought one of the formulas was wrong. I checked the calculations and the input IDs, but the results still did not change.

The problem was that the JavaScript expected an input with the ID `markup`, but I had accidentally left the profit markup field out of the HTML.

Because JavaScript could not find that input, it caused an error while adding the event listeners. That stopped the rest of the script before the first calculation could run.

I added the missing profit markup input:

```
<label class="field" for="markup">
    <span>Profit markup</span>
    <span class="input-wrap">
        <input id="markup" type="number" min="0" step="1" value="30">
        <small>%</small>
    </span>
</label>
```

After refreshing the page, the results updated properly and the default suggested price showed as €7.88.

![The working calculator](images/05-working-calculator.png)

### Saving and resetting settings

I added a save button using local storage.

When the button is pressed, all of the current settings are saved inside the browser. When the page is opened again, it loads the saved values automatically.

The button briefly changes from `Save these settings` to `Settings saved` so the user knows it worked.

I also added a reset button. This restores all of the starting values and removes the saved settings from local storage.

### Final testing

I tested the calculator by changing the filament weight, print time, quantity, labour rate and profit markup.

I checked that:

* The total updates immediately
* Multiple quantities work
* The per-print price stays correct
* The cost breakdown changes
* The coloured bars resize
* Settings stay after refreshing
* Reset returns everything to the defaults
* The layout still works on a smaller screen

With the default values, the calculator gives:

Suggested price: €7.88
Production cost: €6.06
Estimated profit: €1.82

The cost breakdown is:


Filament: €1.87
Electricity: €0.19
Machine wear: €0.45
Labour: €3.00
Failed print allowance: €0.55


### Final thoughts

I am happy with how the project turned out, especially for something I made in one go.

The calculator is simple, but it solves an actual problem I could have when pricing 3D prints. It also works without a database, account or complicated setup.

The biggest thing I learned was that one missing HTML element can stop an entire JavaScript file. The formulas were working, but the script never reached them because it crashed while looking for the missing markup input.

If I work on this again, I would like to add printer profiles, packaging costs and an option to export the final price as a quote.

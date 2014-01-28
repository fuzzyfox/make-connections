## Make Mapping Tool
<https://bugzilla.mozilla.org/show_bug.cgi?id=962506>

**Idea:** create maps/hierarchies of kits through to makes. These maps could be used for navigation, identifying (visually) popular kits, connections between topics, existing learning pathways, etc...

**Flow:**

    Enter a url for a kit

    it finds all the links in the kit for *.makes.org/*

    this is repeated for all makes found

    stops when there are no links w/i *.makes.org domain

    results are then output as json to be passed into a connected node (tree) style visualization, w/ data from makeapi overlaid on each node (make)

    ideally kits, activities, and makes are all visually differentiable

    starting kit sits as root of the tree.

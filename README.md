<div align="center">

# Symbol Art Editor Online
#### Version 1.1.0

## [*Play with it Now*](https://malulleybovo.github.io/SymbolArtEditorOnline/)

<img height="25%" width="25%" src="https://raw.githubusercontent.com/malulleybovo/SymbolArtEditorOnline/master/css/images/arks_logo.png">

</div>

Inspired by the in-game editor from [Phantasy Star Online 2](http://pso2.jp/) (SEGA), 
Symbol Art Editor Online is a browser vector-based image editor used to produce digital art made of symbols.

<div align="center">

##### Tell me your ideas if you think about an extra feature I have not thought about already. Also, if you have knowledge about how *.sar* files are formatted, please enlighten me so I can add support for it.

</div>

### [Usage](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/1-Usage):
- *Click* (*Tap*, or Press ENTER) the Plus Icon on Landing Screen to Create a Symbol Art from Scratch
- *Click* (*Tap*, or Press CTRL+ENTER) the Upload Icon to Select a Valid *.saml* File and Continue Working on an Existing Symbol Art (Works on Both Desktop and Mobile Devices)
- *Click* (*Tap*, or Press ENTER) Top Left List Icon on Editor to Show/Hide the Layer Manager
- *Right Clicking* (or *Swiping Right* in iOS and *Tap and Hold* in Android) any Group/Layer in the Layer Manager to Add, Rename, or Delete them
- *Drag* Layer or Group *Clicked* (*Tapped*) into Another Spot in Layer Manager to Change Position (Layer Priority) of Symbol (Desktop only)
- Pick Layer/Group to Move and Select Where to Move It to by *Right Clicking* on the Layer/Group and Selecting the Respective Option in the Menu
- *Click* (*Tap*) a Layer on Layer Manager to Enable Editing It Through the Edit Buttons Around the Symbol and also Display the Layer Controller and the Color Picker
    - *Drag* Buttons that are Around the Symbol to Perform the Action their Icon Represents
    - *Drag* the Symbol to Move it Across the Canvas
    - *Click* (*Tap*) the Color Picker at the Bottom Right Corner to Change the Color of the Symbol Selected
    - Press and Hold *Space Bar* to Highlight Which Layer is Currently Being Edited (Desktop only)
- *Click* (*Tap*) a Group on Layer Manager to Enable Editing It
    - Drag the Group of Symbols Selected to Move All the Contained Symbols Across Image
- Use *Mouse Wheel* and *Middle Click and Hold* (*Pinch and Zoom*) for Zooming In/Out and Panning Through the Editor
- *Click* (*Tap*, or press Ctrl+Z, Ctrl+Y) the Toolbar Option with the Back and Forward Icons to Undo/Redo (Respectively) Changes Made to the Symbol Art (Can Revert a Maximum of 100 Changes)
- *Click* (*Tap*) the Toolbar Option with the Eyeball Icon to Hide the Interface of any Selected Layer to Have a Nice Clean View of the Artwork
- *Click* (*Tap*) the Toolbar Option with the Musical Note to Show the Sound Manager Menu
    - List Icon in Menu Shows/Hides the List of Available Sounds
    - Volume Icon in Menu Plays the Currently Selected Sound
- *Click* (*Tap*, or press Ctrl+S) the Toolbar Option with the Download Icon to Save Your Work (Due to Restriction, in iOs, this Feature will Result in Opening a New Tab with the Contents of the *.saml* File Representing Your Work)
- If the Toolbar Does Not Display All Tools, Swipe Left or Right to Display Move Tools

### [Importing Symbol Art in *.sar* Format](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/2-Importing-Symbol-Art):
- Download the Third-Party Application [Symbol Art Editor](http://www.pso-world.com/forums/showthread.php?215777-Symbol-Art-Editor-EN-Version) available in www.pso-world.com
- Launch the Application, Click *File->Open*, and Select a Valid *.sar* File
- Upon Loading the Symbol Art, Click *File->Save As*, and Save the Symbol Art in *.saml* Format this Time
- Launch [Symbol Art Editor Online](https://malulleybovo.github.io/SymbolArtEditorOnline/) and Load the *.saml* File by Clicking the Upload Button at the Landing Screen and Choosing the File in your Device

### [Exporting Symbol Art Into Phantasy Star Online 2](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/3-Exporting-Symbol-Art):
- Save Your Work Within Symbol Art Editor Online Using the Download Button in the Toolbar
- Open the Third Party [Symbol Art Editor](http://www.pso-world.com/forums/showthread.php?215777-Symbol-Art-Editor-EN-Version) available in www.pso-world.com
    - Click File->Open and Select the File Just Downloaded.
    - Click File->Save and Save Your Work in *.sar* Format Into *path/to/directory/SEGA/PHANTASYSTARONLINE2/symbolarts/user/* YOUR_USER_ID_FOLDER/
- Login Into the Game, Go to Symbol Arts Menu, Select the *Import* Tab, and Import Your Artwork Into the Game

### [Features](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/4-Features):
- Touch Screen Support ! ! !
- Saving Your Creation to *.saml* Format by Clicking the Download Button on the Toolbar at the Bottom of the Editor
- Loading *.saml* Saved from this Application or from the lacking [Symbol Art Editor](http://www.pso-world.com/forums/showthread.php?215777-Symbol-Art-Editor-EN-Version) available in www.pso-world.com
    - *note:* I have not managed to understand how *.sar* files are formatted (binary file? encrypted?), so no *.sar* support until then unfortunately
- Undo / Redo Changes Made (Add, Rename, Move, or Remove Layer/Group; Any Sort of Symbol Reshaping; Changes in Symbol Color)
- Layer Manager to Organize and Facilitate Your Workflow
    - Drag and Drop Layer/Group to Change Layer Priority
    - (below features can be accessed via context menu opened by right-click, tap and hold, or swipe right)
    - Add Layer (New Symbol)
    - Add Group of Symbols
    - Pick Selected Layer/Group by Clicking (Tapping)
    - Delete Layer/Group
    - Rename Layer/Group
    - Copy / Paste Layers and Groups of Symbols
- Symbol Edit Box to Manipulate the Symbol
    - Drag to Move Symbol Around
    - Stretch Symbol (Diagonally or by Side) using Respective Draggable Buttons on Screen
    - Resize Symbol using Respective Draggable Button on Screen
    - Rotate Symbol using Respective Draggable Button on Screen
- Layer Controller on Top Right Corner of Screen
    - Pick from a Huge Selection of Symbols
    - Flip Symbol Horizontally and/or Vertically
    - Perform Fine Changes in the Position of the Symbol Selected
    - Apply Transparency to Symbols
- Recolor Symbols with a Dedicated Color Picker
    - Colors Used are Saved Inside the Picker for Convenience
- Symbol Art Sound Effect Manager on Center Bottom of Screen
    - Show/Hide List of Available Sounds and Pick the One You Desire
    - Play Button to Test the Sound
- Hold *Space Bar* to View Which Symbol is Currently Selected (Desktop only)
- (Upcoming) Upload an Image to Serve as Overlay to Guide You in Making Art

### [Acknowledgement](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/5-Acknowledgement):
- [PixiJS](http://www.pixijs.com/): For the amazing WebGL renderer that tremendously reduced the amount of work needed to make this application.
- [jQuery](https://jquery.com/): For allowing easy and quick DOM manipulation.
- [jQuery contextMenu Plugin](http://swisnl.github.io/jQuery-contextMenu/index.html): For providing a browser version of the right click context menu of native apps.
- [Spectrum Color Picker](https://bgrins.github.io/spectrum/): For providing a great color picking interface.
- [jQuery Sidebar Plugin](http://jillix.github.io/jQuery-sidebar/): For providing a great sidebar for storing a list of symbols and sounds.
- [jQuery Panzoom Plugin](https://github.com/timmywil/jquery.panzoom): For enabling cross-platform pan and zoom in the application.
- [Toolbar.js](http://paulkinzett.github.io/toolbar/): For providing a great addition to the toolbar designed for the application.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/): For enabling the needed saveAs feature.
- [DatGUI](https://github.com/dataarts/dat.gui): For becoming the skeleton of the layer controller.
- [perfect-scrollbar](https://github.com/noraesae/perfect-scrollbar): For providing a beautiful scrollbar to override the default
- [Font Awesome](http://fontawesome.io/): For providing the great variety of icons used in the application.
    
### [Disclaimer](https://github.com/malulleybovo/SymbolArtEditorOnline/wiki/6-Disclaimer)
- Symbol Art Editor is a proprietary editor developed and owned by [SEGA](http://www.sega.com/). I do not own the idea of a Symbol Art Editor. This is purely a fan-made application inspired by SEGA's editor developed to let other fans and any curious artist have fun crafting symbol artwork outside of the game Phantasy Star Online 2 in a dedicated user-friendly editor engineered to be quick to use and that minimizes effort and repetition required to create quality symbol art. The only profit I expect from this application is people's happiness.

<div align="center">

# *Have Fun~*
## And Happy Art Crafting !

</div>

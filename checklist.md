## **Checklist**

#### FIXED
- [x] color picker not hidden when group is selected
- [x] button positions not updated on windows resize
- [x] moving symbol out of canvas causes symbol not to show up and mouseup event is never triggered while mouse is off canvas
- [x] color picker color selecting screen not hidden onblur
- [x] color picker color selecting screen does not select color when clicked, only onmousemove
- [x] layer priority is inverted (top layer is decided on a descending fashion)
- [x] last selected symbol can still be moved when a group is selected (it should not be interactive)
- [x] when layer is moved, it loses interactivity (should re-activate it)
- [x] moving symbols by group not implemented
- [x] vertices not rounded to nearest integer
- [x] display at top on space press and hold
- [x] moving layers by group does not work for groups containing subgroups
- [x] highlighting layers by group does not work for groups containing subgroups
- [x] symbol art BGE implementation
- [x] fix vertex orientation of quads (orientation is horizontally inverted)
- [x] moving elem into a subgroup and removing it apparently removes element from its previous group
- [x] deleting groups with nested subgroups is malfunctioning (does not delete some quads)
- [x] alpha not implemented (bug detected on the third party .SAML to .SAR converter application that impedes itself from interpreting alpha values correctly. This application then chose to apply 0-7 scale on SAML alpha output)

#### TO BE FIXED
- [ ] \(under dev - 80% done\) list of symbols not implemented
- [ ] list buttons do not display the symbol type preview
- [ ] include chosen BGE in SAML output
- [ ] layer color correction is not 100% correct (color in application does not always match color in game)
- [ ] group folder expand/collapse only on click of the + icon (rethink)
- [ ] adding new layer in list view does not correctly highlight and select the newly created layer
- [ ] click selected list view element again to unselect it
- [ ] add option to output result to image file
- [ ] hide vertex change buttons while user is moving a layer in editor
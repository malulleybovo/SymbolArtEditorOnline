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

#### TO BE FIXED
- [ ] alpha not implemented
- [ ] list of symbols not implemented
- [ ] list buttons do not display the symbol type preview
- [ ] \(under dev\) symbol art BGE not implemented
- [ ] moving elem into a subgroup and removing it apparently removes element from its previous group
- [ ] layer color correction is not 100% correct (color in application does not always match color in game)
- [ ] group folder expand/collapse only on click of the + icon (rethink)

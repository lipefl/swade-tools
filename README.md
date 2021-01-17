# SWADE Tools
A Foundry VTT module for use with Savage Worlds (SWADE system).

A series of automations for swade: Joker's Wild (with bonus); Status Management (with icons); Reroll with a benny; detect targets, hit and damage; etc. 

This is my first big module, please report if you see any bugs and be nice :)

## Features Available (v1.0.0)

1. Automatically rolls initiative when combat starts 
2. Distribute bennies automatically when a Joker is drawn (Joker's Wild)
3. Add +2 Bonus when a character has a Joker
4. Show icons on the tokens for the status, wounds and fatigue. And link status that apply another: Stunned also marks Distracted and Vulnerable. (integration only from Sheet to Token for now)
5. Manage Status automatically during the combat. Rolls to remove Stunned and Shaken (offer a to use a benny if it fails), removes Distracted and Vulnerable at the end of turn. Shows a warn for Entagled and Bound
6. Shows a button to Reroll with a Benny in every roll. And shows a critical failure message (hiding the benny button in this case)
7. Weapons and Powers show a dialog box instead of sending to chat directly. They also count shots and power points automatically (can be disabled in module settings)
8. Weapons and Powers auto-detect when targets are selected, showing hit, raise with a button to roll damage and apply wounds.
9. Translation support (English, Portuguese BR and Spanish available)
10. DiceSoNice Support (with benny animations)

## v1.1.0

11. Conviction Support: +1d6 Bonus is automatically added to item/power rolls now. In combat, will auto deactivate Conviction at the end of the turn, offering to spend a Benny to keep it active for another round.
12. Soak Damage: Shows an icon next to the "apply damage" button to soak damage.

+ bug fixes related to targeting, button behaviour and synthetic actors status and items not working properly

More features will be added...

### Bonus: Macro
A Macro that shows the "Quick Access" of the selected token and rolls the basic skill with a checkbox to show more options (in dialog). Only works with the module.

## Installation Link
https://raw.githubusercontent.com/lipefl/swade-tools/main/module.json

## Settings
Most of the module will be enabled by default, so if you want to disable something, post an issue. I'm planning on adding more options in the settings.

## Screenshots
![](https://i.imgur.com/vrybiSO.jpg)

![](https://i.imgur.com/jeDZzgf.jpg)

![](https://i.imgur.com/YG1IU5W.jpg)

![](https://i.imgur.com/68Ym14p.jpg)

![](https://i.imgur.com/gVJDthp.jpg)

![](https://i.imgur.com/Xxt5cOh.jpg)

![](https://i.imgur.com/wh2j1Wx.jpg)

## Next Planned Features
1. Watch for Special Abilities, Edges and Core Setting Rules to auto add modifiers or modify how Swade Tools behave

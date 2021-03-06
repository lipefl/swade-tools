# SWADE Tools

## ATTENTION
Swade Tools v1.4+ is only compatible with Foundry v0.8.7+ (maybe 0.8.6) and SWADE system v0.19+

If you use Foundry v0.7.9 (or 0.7.10), please install Swade Tools v1.3.6 manually (see releases)

## About the Module
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
9. Translation support (English, Portuguese BR, Spanish, Italian, Catalan and German available)
10. DiceSoNice Support (with benny animations)

## v1.1.0

11. Conviction Support: +1d6 Bonus is automatically added to item/power rolls now. In combat, will auto deactivate Conviction at the end of the turn, offering to spend a Benny to keep it active for another round.
12. Soak Damage: Shows an icon next to the "apply damage" button to soak damage.

**Fixes**
+ bug fixes related to targeting, button behaviour and synthetic actors status and items not working properly

## v1.2.0

13. Detect Edges/Abilities and apply bonus. Supported: Elan, No Mercy, Iron Jaw, Combat Reflexes, Construct, Hardy, Undead
14. Allow configuring some Setting Rules to modify how Swade Tools behave. Supported: Dumb Luck, Hard Choices, Unarmored Hero, Wound Cap

**Fixes**
+ read ammo settings from swade system (v 0.16). Added button to reload and Inventory ammo.
+ better item dialog layout when more than 3 buttons
+ Multiple AB properly support
+ dice so nice/swade wild dice config support 
+ Vehicle support
+ Token Action Hud, Maestro and other modules compatibility
+ Italian translation added

## v1.3.0
Version compatible with SWADE system v0.17+ only

15. Added Out of Control and Gritty Damage auto roll tables (v1.3.1)

## v1.4.0
Version compatible with Foundry VTT v0.8.7 and SWADE system v0.19

**Changes**
+ Notifications about changing settings automatically
+ Auto Disabling Jokers Wild setting on swade system for now, can be enabled if you Disable Jokers Wild in Swade Tools (it'll probably be removed from Swade Tools once the swade system is fully working with NPCs)
+ There's now an option to not auto-roll initiative when combat starts. 
+ Now Swade Tools is using auto iniative setting from swade system, but it will enable it automatically. It can be disabled if you choose to not auto-roll initiative when combat starts.
+ Better vehicle damage
+ German language added
+ Warn about swade version
+ Card-like layout for items
+ better RoF targeting
+ Catalan translation added 

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
+ Re-targeting button
+ Raise Calculator button
+ Adventure Cards integration
+ Review of character points distribution


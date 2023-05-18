## NEW UPDATES
Check the Releases!

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

## v1.1.x

11. Conviction Support: +1d6 Bonus is automatically added to item/power rolls now. In combat, will auto deactivate Conviction at the end of the turn, offering to spend a Benny to keep it active for another round.
12. Soak Damage: Shows an icon next to the "apply damage" button to soak damage.

**Fixes**
+ bug fixes related to targeting, button behaviour and synthetic actors status and items not working properly

## v1.2.x

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

## v1.3.x
Version compatible with SWADE system v0.17+ only

15. Added Out of Control and Gritty Damage auto roll tables (v1.3.1)

## v1.4.x
Version compatible with Foundry VTT v0.8.7 and SWADE system v0.20

**Changes**
+ Notifications about changing settings automatically
+ There's now an option to not auto-roll initiative when combat starts. 
+ Now Swade Tools is using auto iniative setting from swade system, but it will enable it automatically. It can be disabled if you choose to not auto-roll initiative when combat starts.
+ Better vehicle damage
+ German and Catalan languages added
+ Warn about swade version
+ Card-like layout for items
+ better RoF targeting
+ If the weapon has multiple damage action, you can change the damage to roll after Hit/Raise instead of default damage
+ Jokers Wild removed from swade tools (since swade system option is now fully functional)
+ Item asks for a skill when the skill field is empty (and save the choice for future rolls)
+ "Count PP" option removed in favor of system setting "No Power Points"
+ New option to always show Situational Modifiers for target

**Fixes**
+ Combat automation remade (it wasn't working with the new swade system initiative)
+ Fixed problem with joker bonus duplicating (from system and swade tools)
+ Fixed problem with "Doesn't need reload" option


## v1.5.x
+ Apply "Assign Status Effect" via token
+ Calculates Gang Up, Range and Ranged Weapon in Melee (shows a (?) icon in the target with more info)
+ Bonus Macro to turn all your PCs Friendly and NPCs Hostile (to work with Gang Up)
+ New Edges automations: Block, Improved Block, Dodge, Frenzy, Formation Fighter (from Pathfinder, thanks to @bloy)
+ Special abilities are separated from edges and now searched as abilities (thanks to @bloy) or edges

**Fixes**
+ Stunned allows distracted to be removed at the end of next turn (as in the rules)

## v1.6.x
+ Calculate Scale automatically (shows a checkbox for creatures with Swat)
+ Option to activate a button to Reload X (instead of full reload)
+ Option to disable Status Icons (so you can use whatever you want with CUB)
+ Option to disable automatic rolls (remove Shaken,Stunned) during combat
+ Compatibility with Automated Animations and SWADE Sfx & Vfx Enchantments

**Fixes**
+ Wild attack is now a checkbox, so you can use it with Frenzy and other attacks.
+ Fixed bugs with attack from vehicles

## v1.7.x
+ Compatibility with Foundry v9 and SWADE System v0.22

## v1.8.x
+ Compatibility with SWADE system v1.0
+ Simpler Dialog Rolls for attributes and skills (enabled by default, can be disabled in settings)
+ New Buttons and funcionality for GMs: Add Modifier, Raise Calculator and Use GM targets
+ Added an option to use Called Shots (calculated automatically)
+ Added an option to use Wild Attack with other skills (like in Pathfinder setting)
+ Added an option to disable automatic rolls (Shaken, Stunned) only for PCs

**Fixes**
+ Auto Initiative config removed since Auto Iniative from system is now doing the same.
+ Hard Choices is removed and uses the new system setting
+ Fixed a bug with distance and bigger tokens. Better distance calc for grid vs no-grid (based on scene config)
+ Fixed a minor bug when the Character is using Fighting but don't have the skill

## v1.9.x
+ "Roll From Selected" macro to roll a trait from all selected tokens
+ Free Reroll button (thanks to @bloy)
+ Rapid Fire autodetection (thanks to @bloy)
+ Auto Update Max Wounds based on Wildcard/Extra and Size
+ Auto Update Token width/height based on Size.
+ "Boost/Lower Trait" macro for selected tokens (add skill if actor doesnt have it)
+ Automatically link (and unlink) tokens if the actor is wildcard (or not)
+ Min Str affects damage dice and also trait rolls based on armor equipped or ranged weapon (not able to affect Pace, since swade system auto-calculates it)

**Fixes**
+ Items now allow Attributes as roll trait
+ Compatibility with swade system v1.1.1 (from SWADE Tools v1.9.6, open an issue if you see any problems)
+ Now allow an item to have an empty trait (hides trait button)
+ Wild attack between turns/rounds now work properly 
+ Combat round start fixed
+ Token hud compatibility with Simple Trait Roll option

## v1.10.x
+ Checks for Unstoppable (and ignores it if the attacker has a Joker)
+ Option to disable automatic Range calculation and modifiers
+ Option to show common modifiers as selection - Multi-Action, Cover, Illumination (thanks to @EternalRider)
+ Desperate Attack (option must be enabled in settings)
+ Heavy Armor detection (only Heavy Weapon does damage)
+ Button to activate Arcane Device (roll and spend PP from item)

**Fixes**
+ Compatibility with Foundry v10
+ MinStr now checks for Soldier and Brawny edges
+ GangUp now ignores tokens behind walls
+ Linked Status (Stunned, Entagled, Bound) are now managed only by SWADE system to avoid bugs or compatibility errors
+ Rerolling a failed power now detects success and removes PP accordingly (and hide failure message)
+ Running die also simplified when "Simple Rolls" is enabled

## v1.11.x (Last Update)
+ Added quick template buttons for powers
+ Added + and - buttons for number inputs (Mod field still accepts dice modifier)
+ Resist actions compatibility with SWADE System
+ Option to disable Wounds/Fatigue Icons
+ Allow using the same damage roll for multiple targets
+ Added automatic Pack Tatics bonus damage (thanks to @EternalRider)
+ Added automatic Cover for shields or other items with Cover (can be disabled in settings)

**Fixes**
+ Size Effect items now updates the sheet (as in the Size input)
+ Vehicle Maneuver button fixed
+ Async rolls (thanks to @inxaos)
+ Removed Called Shot (Torso) shown on damage
+ Fixed RoF bug for NPCs
+ Fixed minor bug for power fail not spending PP when success with reroll

# Behringer WING

## Description

This Module controls the Behringer WING series of consoles.
See the [offical Behringer website](https://www.behringer.com/product.html?modelCode=P0BV2) to get additional information about the consoles, their capabilities and firmware updates.

## Capabilities

Using this Companion module, you can do all these cool things!

- Control fader levels absolutely, relatively, created fades, store their values and recall them
- Control panorama values the same
- Do all of the above for any send
- Control mutes
- Recall scenes
- Control talkbacks
- and much more...

See the [Supported Actions](#supported-actions) section below for a complete list of available actions.

### Missing Features

If you find any missing features that you would like to see implemented, please open an issue on the [GitHub repository](https://github.com/bitfocus/companion-module-behringer-wing/issues).

## Configuration

- **Desk IP**: The IP address of the desk to connect to. Auto-detects any WING type console in the same network.
- **Desk Type**: Specifies the type of desk that is connected.
- **Fader Update Rate**: Specifies how often the module sends fader level updates to the console when using smooth fader movements. Lower values result in smoother fades but increase network traffic.
- **Status Poll Rate**: Specifies how often the module polls the console for status updates. Higher values reduce network traffic but may result in slower updates.
- **Variable Update Rates** Specifies the rate at which received console information is processed and variables are updated. Higher values reduce CPU usage but may result in slower variable updates.

## Subcription

This module uses a subscription to receive updates from the console. When any change on the console occurs, such as a fader level change, the console sends this information to the companion module.
Unlike other Behringer consoles, the WING series only supports one active subscription at a time, with the most recent one being the **only** receiver.

If you want to use another application that depends on WING subscription data, some of the data may not be coherent across subscribers.

## Troubleshooting

If you experience issues with the module not receiving updates from the console, try the following steps:

1. Restart the companion instance to re-establish the subscription.
2. Ensure that no other application is actively subscribed to the console.
3. Check the network connection between the companion host and the console.

If you continue to experience issues, you can open an issue on the [GitHub repository](https://github.com/bitfocus/companion-module-behringer-wing/issues) for further assistance.

## Detailed Action Reference

### Supported Actions

| Name | Description |
|------|-------------|
| Adjust Direct Input Level | Adjust the level of a direct input on a matrix |
| Adjust Fader Level | Adjust the level of a channel, aux, bus, dca, matrix or main. |
| Adjust Gain | Adjust the input gain of a channel or aux. |
| Adjust Panorama | Adjust the panorama of a channel, aux, bus, matrix or main. |
| Adjust Send Level | Adjust the send level from a destination channel strip to a source |
| Adjust Send Panorama | Adjust the panorama of a send from a channel or aux to a bus or matrix. |
| Clear Solo | Clear the Solo from all channels, auxes, busses, matrices and mains. |
| Invert Direct Input | Invert the polarity of a direct input on a matrix |
| Recall Direct Input Level | Recall the level of a direct input on a matrix |
| Recall Scene by Number | Recall scene in a show by its number |
| Restore Gain | Restore the gain of a channel or aux. |
| Restore Level | Restore the fader level of a channel, aux, bus, dca, matrix or main. |
| Restore Panorama | Restore the panorama of a channel, aux, bus, matrix or main. |
| Restore Send Level | Restore the send level from a destination channel strip to a source |
| Restore Send Panorama | Restore the panorama of a send from a channel or aux to a bus or matrix. |
| Send Command | Send an OSC command with no argument to the console. |
| Send Command with Number | Send an OSC command with a number as an argument to the console. |
| Send Command with String | Send an OSC command with a string as an argument to the console. |
| Send Library Action | Trigger a library action (Select and navigate scenes in a show) |
| Set Channel EQ Model | Set the EQ model for a channel. |
| Set Channel EQ Parameter | Set the parameter of an equalizer in a channel |
| Set Channel Filter Model | Set the filter model for a channel. |
| Set Channel Icon | Set the icon displayed for a channel. |
| Set Channel Process Order | Set the process order of EQ, gate, dynamics and insert of a channel. |
| Set Channel/Aux Alt Connection | Set the index of the alt connection of a channel or aux |
| Set Channel/Aux Auto Source Switch | Enable or disable the global switching between main and alt inputs on a channel or aux |
| Set Channel/Aux Main Connection | Set the index of the main connection of a channel or aux |
| Set Channel/Aux Main/Alt | Set whether a channel or aux is using the main or alt input |
| Set Delay | Enable or disable the delay of a channel, bus, matrix or main. |
| Set Delay Mode | Set the delay mode of a channel, bus, matrix or main. |
| Set Direct Input Level | Set the level of a direct input on a matrix |
| Set Direct Input Mute | Set or toggle the direct input on a matrix |
| Set Direct Input Source | Set the source of a direct input on a matrix |
| Set Dynamics On | Enable, disable or toggle the on-state of dynamics on a channel, bus, aux, matrix or main. |
| Set EQ On | Enable, disable or toggle the on-state of an EQ on a channel, bus, aux, matrix or main. |
| Set Gain | Set the input gain of a channel or aux. |
| Set Gate On | Enable, disable or toggle the on-state of a gate on a channel |
| Set GPIO Mode | Configure the mode of a GPIO |
| Set GPIO State | Set the state of a GPIO |
| Set Insert On | Enable or disable an insert for a channel, aux, bus, matrix or main. |
| Set Level | Set the fader level of a channel, aux, bus, dca, matrix or main to a value. |
| Set Main/Alt Switch | Sets the desk to use the configured main/alt input sources. |
| Set Mute | Set or toggle the mute state of a channel, aux, bus, dca, matrix or main. |
| Set Name | Set the name of a channel, aux, bus, dca, matrix, main, or a mutegroup. |
| Set Panorama | Set the panorama of a channel, aux, bus, matrix or main. |
| Set Scribble Light | Set or toggle the scribble light state of a channel, aux, bus, dca, matrix, or main. |
| Set Scribble Light Color | Set the scribble light color of a channel, aux, bus, dca, matrix, or main. |
| Set Selected | Set Selected Channel Strip |
| Set Send Level | Set the send level from a destination channel strip to a source |
| Set Send Mute | Set or toggle the mute state of a send from a destination channel strip to a source |
| Set Send Panorama | Set the panorama of a send from a channel or aux to a bus or matrix. |
| Set SOF | Set Sends on Fader |
| Set Solo | Set the solo state for a channel, aux, bux, matrix or main |
| Set Solo Dim | Set or toggle the dim state of the solo output. |
| Set Solo LR Swap | Set the left-right channel swap of the solo channel. |
| Set Solo Mono | Set or toggle the mono state of the solo output. |
| Set Solo Mute | Set or toggle the mute state of the solo output. |
| Store Direct Input Level | Store the fader level of a direct input on a matrix |
| Store Gain | Store the gain of a channel or aux. |
| Store Level | Store the fader level of a channel, aux, bus, dca, matrix or main. |
| Store Panorama | Store the panorama of a channel, aux, bus, matrix or main. |
| Store Send Level | Store the send level from a destination channel strip to a source |
| Store Send Panorama | Store the panorama of a send from a channel or aux to a bus or matrix. |
| Talkback Assign | Enable, disable or toggle the assignment of a talkback to a bus, matrix or main. |
| Talkback Bus Dim | Set the the bus dim amount of a talkback channel. |
| Talkback Individual Levels | Enable or disable individual bus and main talkback levels. |
| Talkback Mode | Set the mode of a talkback channel. |
| Talkback Monitor Dim | Set the the monitor dim amount of a talkback channel. |
| Talkback On | Enable or disable the on state of a talkback. |
| Undo Direct Input Level Adjustment | Undo the previous level adjustment of a direct input on a matrix |
| Undo Gain Adjust | Undo the previous input gain adjustment on a channel or aux. |
| Undo Level Adjust | Undo the previous level adjustment on a channel, aux, bus, dca, matrix or main. |
| Undo Panorama Adjust | Undo the previous adjustment on the panorama of a channel, aux, bus, matrix or main. |
| Undo Send Level Adjust | Undo the previous send level adjustment from a destination channel strip to a source |
| Undo Send Panorama Adjust | Undo the panorama adjustment of a send from a channel or aux to a bus or matrix. |
| USB: Playback Action | Start, stop, pause, jump to previous or next in the USB player. |
| USB: Record Action | Start, stop, pause or create a new file in the USB recorder. |
| USB: Set Repeat | Enable the repeat functionality of the USB player |
| WLive: Add Marker | Add a marker to a recording on a card. |
| WLive: Card Action | Start, stop, pause or record on a card. |
| WLive: Delete Marker | Delete a marker from a recording on a card. |
| WLive: Delete Session | Delete a session on a card. |
| WLive: Edit Marker | Edit a marker in a recording on a card. Sets the marker number to the current position. |
| WLive: Format Card | Format (delete all contents) of a card. |
| WLive: Goto Marker | Go to a marker in a recording on a card. |
| WLive: Name Session | Name the current session on a card. |
| WLive: Open Session | Open a session on a card. |
| WLive: Set Auto Input | Set which cards should be used for auto input selection. |
| WLive: Set Auto Play | Set input actions on play |
| WLive: Set Auto Record | Set input actions on record |
| WLive: Set Auto Stop | Set input actions on stop |
| WLive: Set Link | Set whether the USB cards should be linked or unlinked. |
| WLive: Set Position | Set the position of a recording on a card. |


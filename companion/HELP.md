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
| Category | Name | Description |
|----------|------|-------------|
| Cards | WLive: Add Marker | Add a marker to a recording on a card. |
| Cards | WLive: Card Action | Start, stop, pause or record on a card. |
| Cards | WLive: Delete Marker | Delete a marker from a recording on a card. |
| Cards | WLive: Delete Session | Delete a session on a card. |
| Cards | WLive: Edit Marker | Edit a marker in a recording on a card. Sets the marker number to the current position. |
| Cards | WLive: Format Card | Format (delete all contents) of a card. |
| Cards | WLive: Goto Marker | Go to a marker in a recording on a card. |
| Cards | WLive: Name Session | Name the current session on a card. |
| Cards | WLive: Open Session | Open a session on a card. |
| Cards | WLive: Set Auto Input | Set which cards should be used for auto input selection. |
| Cards | WLive: Set Auto Play | Set input actions on play |
| Cards | WLive: Set Auto Record | Set input actions on record |
| Cards | WLive: Set Auto Stop | Set input actions on stop |
| Cards | WLive: Set Link | Set whether the USB cards should be linked or unlinked. |
| Cards | WLive: Set Position | Set the position of a recording on a card. |
| Channel | Set Channel EQ Model | Set the EQ model for a channel. |
| Channel | Set Channel EQ Parameter | Set the parameter of an equalizer in a channel |
| Channel | Set Channel Filter Model | Set the filter model for a channel. |
| Channel | Set Channel Process Order | Set the process order of EQ, gate, dynamics and insert of a channel. |
| Common | Adjust Fader Level | Adjust the level of a channel, aux, bus, dca, matrix or main. |
| Common | Adjust Gain | Adjust the input gain of a channel or aux. |
| Common | Adjust Panorama | Adjust the panorama of a channel, aux, bus, matrix or main. |
| Common | Adjust Send Level | Adjust the send level from a destination channel strip to a source |
| Common | Adjust Send Panorama | Adjust the panorama of a send from a channel or aux to a bus or matrix. |
| Common | Clear Solo | Clear the Solo from all channels, auxes, busses, matrices and mains. |
| Common | Restore Gain | Restore the gain of a channel or aux. |
| Common | Restore Level | Restore the fader level of a channel, aux, bus, dca, matrix or main. |
| Common | Restore Panorama | Restore the panorama of a channel, aux, bus, matrix or main. |
| Common | Restore Send Level | Restore the send level from a destination channel strip to a source |
| Common | Restore Send Panorama | Restore the panorama of a send from a channel or aux to a bus or matrix. |
| Common | Set Channel Icon | Set the icon displayed for a channel. |
| Common | Set Channel/Aux Alt Connection | Set the index of the alt connection of a channel or aux |
| Common | Set Channel/Aux Auto Source Switch | Enable or disable the global switching between main and alt inputs on a channel or aux |
| Common | Set Channel/Aux Main Connection | Set the index of the main connection of a channel or aux |
| Common | Set Channel/Aux Main/Alt | Set whether a channel or aux is using the main or alt input |
| Common | Set Delay | Enable or disable the delay of a channel, bus, matrix or main. |
| Common | Set Delay Mode | Set the delay mode of a channel, bus, matrix or main. |
| Common | Set Dynamics On | Enable, disable or toggle the on-state of dynamics on a channel, bus, aux, matrix or main. |
| Common | Set EQ On | Enable, disable or toggle the on-state of an EQ on a channel, bus, aux, matrix or main. |
| Common | Set Gain | Set the input gain of a channel or aux. |
| Common | Set Gate On | Enable, disable or toggle the on-state of a gate on a channel |
| Common | Set Insert On | Enable or disable an insert for a channel, aux, bus, matrix or main. |
| Common | Set Level | Set the fader level of a channel, aux, bus, dca, matrix or main to a value. |
| Common | Set Mute | Set or toggle the mute state of a channel, aux, bus, dca, matrix or main. |
| Common | Set Name | Set the name of a channel, aux, bus, dca, matrix, main, or a mutegroup. |
| Common | Set Panorama | Set the panorama of a channel, aux, bus, matrix or main. |
| Common | Set Scribble Light | Set or toggle the scribble light state of a channel, aux, bus, dca, matrix, or main. |
| Common | Set Scribble Light Color | Set the scribble light color of a channel, aux, bus, dca, matrix, or main. |
| Common | Set Send Level | Set the send level from a destination channel strip to a source |
| Common | Set Send Mute | Set or toggle the mute state of a send from a destination channel strip to a source |
| Common | Set Send Panorama | Set the panorama of a send from a channel or aux to a bus or matrix. |
| Common | Set Solo | Set the solo state for a channel, aux, bux, matrix or main |
| Common | Store Gain | Store the gain of a channel or aux. |
| Common | Store Level | Store the fader level of a channel, aux, bus, dca, matrix or main. |
| Common | Store Panorama | Store the panorama of a channel, aux, bus, matrix or main. |
| Common | Store Send Level | Store the send level from a destination channel strip to a source |
| Common | Store Send Panorama | Store the panorama of a send from a channel or aux to a bus or matrix. |
| Common | Undo Gain Adjust | Undo the previous input gain adjustment on a channel or aux. |
| Common | Undo Level Adjust | Undo the previous level adjustment on a channel, aux, bus, dca, matrix or main. |
| Common | Undo Panorama Adjust | Undo the previous adjustment on the panorama of a channel, aux, bus, matrix or main. |
| Common | Undo Send Level Adjust | Undo the previous send level adjustment from a destination channel strip to a source |
| Common | Undo Send Panorama Adjust | Undo the panorama adjustment of a send from a channel or aux to a bus or matrix. |
| Configuration | Set Monitor PFL Dim | Set the PFL dim amount of a monitor channel (0 to 40 dB). |
| Configuration | Set Monitor Source Level | Set the source level of a monitor channel (-144 to 10 dB). |
| Configuration | Set Solo Dim | Set or toggle the dim state of the solo output. |
| Configuration | Set Solo LR Swap | Set the left-right channel swap of the solo channel. |
| Configuration | Set Solo Mono | Set or toggle the mono state of the solo output. |
| Configuration | Set Solo Mute | Set or toggle the mute state of the solo output. |
| Configuration | Talkback Assign | Enable, disable or toggle the assignment of a talkback to a bus, matrix or main. |
| Configuration | Talkback Bus Dim | Set the the bus dim amount of a talkback channel. |
| Configuration | Talkback Individual Levels | Enable or disable individual bus and main talkback levels. |
| Configuration | Talkback Mode | Set the mode of a talkback channel. |
| Configuration | Talkback Monitor Dim | Set the the monitor dim amount of a talkback channel. |
| Configuration | Talkback On | Enable or disable the on state of a talkback. |
| Control | Recall Scene by Number | Recall scene in a show by its number |
| Control | Send Library Action | Trigger a library action (Select and navigate scenes in a show) |
| Control | Set GPIO Mode | Configure the mode of a GPIO |
| Control | Set GPIO State | Set the state of a GPIO |
| Control | Set Light Intensities | Set the intensities of console lights. (leave empty for no change) |
| Control | Set Selected | Set Selected Channel Strip |
| Control | Set SOF | Set Sends on Fader |
| IO | Set Main/Alt Switch | Sets the desk to use the configured main/alt input sources. |
| Matrix | Adjust Direct Input Level | Adjust the level of a direct input on a matrix |
| Matrix | Invert Direct Input | Invert the polarity of a direct input on a matrix |
| Matrix | Recall Direct Input Level | Recall the level of a direct input on a matrix |
| Matrix | Set Direct Input Level | Set the level of a direct input on a matrix |
| Matrix | Set Direct Input Mute | Set or toggle the direct input on a matrix |
| Matrix | Set Direct Input Source | Set the source of a direct input on a matrix |
| Matrix | Store Direct Input Level | Store the fader level of a direct input on a matrix |
| Matrix | Undo Direct Input Level Adjustment | Undo the previous level adjustment of a direct input on a matrix |
| Other | Send Command | Send an OSC command with no argument to the console. |
| Other | Send Command with Number | Send an OSC command with a number as an argument to the console. |
| Other | Send Command with String | Send an OSC command with a string as an argument to the console. |
| USB Player | USB: Playback Action | Start, stop, pause, jump to previous or next in the USB player. |
| USB Player | USB: Record Action | Start, stop, pause or create a new file in the USB recorder. |
| USB Player | USB: Set Repeat | Enable the repeat functionality of the USB player |


### Supported Variables

The list of all variables that are supported by this module is far too long. Please find the explanation of the variable naming scheme below:

If a variable relates to a specific channel strip (like a channel, aux, bus, matrix, dca or main), the variable name starts with the type and number of the channel strip, e.g. `ch1_` for channel 1.

The property names are constructed in a way that they are similar to the action names. For example, the fader level of channel 1 is available in the variable `ch1_level`.

If a variable relates to a property that is specific for one strip to another, the variable name starts with the source and destination identifiers. For example, the send level from channel 1 to bus 1 is available in the variable `ch1_to_bus1_send_level`.

To use a variable in a text field, use the following syntax: `${<module_name>:<variable_name>}`. For example, to use the fader level of channel 1 and your instance of the module is named `wing`, use `${wing:ch1_level}`.

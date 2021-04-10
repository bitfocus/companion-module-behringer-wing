**Behringer WING**

This Module controls the Behringer WING series of consoles
go over to [Behringer](https://www.behringer.com/product.html?modelCode=P0BV2)
to get additional information about the consoles and their capabilities.

**Please note:** This module uses a subscription command to receive updates from the console when something changes, such as Channel 5 fader *moved* or Channal 10 *muted*. Unlike other Behringer consoles, the WING only supports one subscription at a time, with the most recent request being the only receiver. If you use another app to control the WING at the same time, some of the Feedback information may not match the current console status.

## Configuration
**Target IP:** Enter the IP address of the Mixer

## Supported Actions
Console Function | What it does
-----------------|---------------
Mute | Mutes or Unmutes the selected Strip*. Includes Mute Groups.
Fader Set | Sets the level of the selected Strip to a specific value
Fader Adjust | Adjust the selected Strip fader up or down by steps **see notes*
Store Fader | Stores the selected Strip fader value for later recall **see notes*
Recall Fader | Recalls the stored value to the Selected Strip
Name | Sets the text label in the Selected scribble strip. Includes Mute Groups.
Color | Sets the LED color of the Selected Strip.
LED | Set the LED for the selected Strip to On/Off.
(Bus)* send On | Enable Bus send for Selected Strip and Bus
(Bus) Store| Stores the send level for the Selected Strip and Bus for later recall **see notes*
(Bus) Recall | Recalls the Bus send level for the Selected Strip and Bus
Solo | Enables the Solo function for the Selected Strip
Solo Dim | Dims the Solo output level to the value configured in the console.
Solo Mute | Mutes the Solo output
Solo Mono | Controls the Mono mix-down of the Solo output

**Note *Strips*:**  These are strips with faders: Channel, Aux, Bus, Main, Matrix, DCA

**Note *mute, LED, slolo*:** These actions also have a Toggle option that inverts the current state of the board channel.

**Note *fader adjustment*:** This module uses an internal fader *position* as a range from 0.0 (-oo dB) to 100.0 (+10dB). Fader changes also have an optional duration of 0 to 60000 mSec (0 to 60 seconds) to create cross fades.

**Note *Storage and Recall*:** Each channel or bus send has one save value. Recall will only restore the last value saved. There are also 10 Global slots available to store a value that may be recalled to any channel. Recalling an empty slot will have no effect.

## Dynamic Variables
Variable | Description
-----------------|---------------
**$(INSTANCENAME:m_ip)** | Mixer IP Address
**$(INSTANCENAME:m_name)** | Mixer Name
**$(INSTANCENAME:m_model)** | Mixer Model
**$(INSTANCENAME:m_serial** | Mixer Serial #
**$(INSTANCENAME:m_fw)** | Mixer Firmware
**$(INSTANCENAME:{Strip}_d)** | Strip fader level in dB **see notes*
**$(INSTANCENAME:{Strip}_p)** | Strip fader level in % (0-100)
**$(INSTANCENAME:{Strip}_n)** | Strip label Name
**$(INSTANCENAME:{Strip}_{Bus}_d)** | Bus send level of {Strip} to {Bus} in dB
**$(INSTANCENAME:{Strip}_{Bus}_p)** | Bus send level in % (0-100)

**Note *{Strip}*:** Strip variable names are created from the Strip type (ch,aux,main) plus the Strip Number. For example, $(INSTANCENAME:ch5_d) will show the value for Channel 5 in dB. *{Bus}* is created the same way.

## Feedback
Variable | Description
-----------------|---------------
**Color when Strip muted** | Sets the button color if the selected Strip is muted
**Color of Strip** | Sets the button Text color to match the seleted Strip color
**Color when LED on**| Sets the button color to match the selected Strip color when the LED is on
**Indicate Solo** | Adds the solo overlay when selected Strip Solo is on
**Color when Solo Mute** | Sets the button color when the Solo output is muted
**Color when Solo Mono** | Sets the button color when the Solo output is mono
**Color when Solo Dim** | Sets the button color when the Solo output is dimmed

## Notes

Solo Feedback indicator changes the button color to white text on black with an overlay:<br>
![Solo](images/solo-opaque.png "Solo")

For additional actions please raise a feature request at [github](https://github.com/bitfocus/companion-module-behringer-wing)


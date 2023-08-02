# translate
Now translating your mobile app's languages has become very easy and there are no costs involved.

Problem Description

The translation tool has some restrictions on the content of the XML file strings to ensure proper functionality and compatibility. Specifically, the strings within the XML files should not contain the following special symbols:
	
( \n ): Newline characters should not be present within the strings.
 Incorrect: <string name="string1"> Hello, \n world! </string>
 Correct: 	<string name="string1"> Hello, world! </string> 

( " " ): Double quotes should not appear inside the strings.
 Incorrect: <string name="string2">"Welcome" Message</string>
 Correct: 	<string name="string2">Welcome Message</string> 
 
( ' ' ): Single quotes should not be present within the strings.
 Incorrect: <string name="string3">'Important' details</string>
 Correct: 	<string name="string3">Important details</string> 	

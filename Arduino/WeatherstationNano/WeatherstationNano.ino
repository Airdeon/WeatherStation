#include <VirtualWire.h>
#include <string.h>
#include <DHT.h>
#include <Wire.h>
#include <Sleep_n0m1.h>
#include "Adafruit_MCP23017.h"

//serial number for seperate measure from other station
const int serialNumber = 10001;

//battery
const float TensionMin = 6.0f; //tension min
const float TensionMax = 7.5f; //tension max

//Initialize Sleep lib
Sleep sleep;
unsigned long sleepTime;



// For Real millis in minute
float myMinute = 0.0f;
unsigned long millisLastTime = 0;
int minuteAtLastEraseCheck;

//Initialize wind speed and direction
Adafruit_MCP23017 mcp;
const int hallPinWindSpeed = 3;
const int corectionWindSpeed = 6;
const float spoonDistance = 0.085;//distance in meter between center of the spoon and central axe
int windCounter = 0;
int windCountLastTime = 0;
int timeLastTime;
int oldWindCounter = 0;
const int windHistoryNumber = 120;
float windHistory[windHistoryNumber];
int currentIndex = 0;

//Initialize variable for rainmeter
int millisFromLastWaterCounter;
int waterCounter = 0;
const int hallPinRainMeter = 2;//pin for hall sensor
int oldWaterCount = 0;

//Initialize DTH22 Temperature and humidity
#define DHT22PIN 4    // pin of DHT22
#define DHT22TYPE DHT22     // DHT 22
DHT dht22(DHT22PIN, DHT22TYPE);

void setup()
{
	// Serial for debug only
	Serial.begin(9600);

	// Sleep time by default
	sleepTime = 30000; //set sleep time in ms, max sleep time is 49.7 days

	// Initialise dht sensor
	dht22.begin();

	// Initialise mpc controler for wind direction
	mcp.begin();      // use default address 0
  	mcp.pinMode(4, INPUT);
  	mcp.pullUp(4, HIGH);
  	mcp.pinMode(5, INPUT);
  	mcp.pullUp(5, HIGH);
  	mcp.pinMode(6, INPUT);
  	mcp.pullUp(6, HIGH);
  	mcp.pinMode(7, INPUT);
  	mcp.pullUp(7, HIGH);
  	mcp.pinMode(8, INPUT);
  	mcp.pullUp(8, HIGH);
  	mcp.pinMode(9, INPUT);
  	mcp.pullUp(9, HIGH);
  	mcp.pinMode(10, INPUT);
  	mcp.pullUp(10, HIGH);
  	mcp.pinMode(11, INPUT);
  	mcp.pullUp(11, HIGH);
  	mcp.pinMode(0, OUTPUT);

	// Initialize pin for battery test
	pinMode(9, OUTPUT);

	// Initialise Transmiter
	vw_set_ptt_inverted(true); // Required for DR3100
	vw_setup(2000);  // Bits per sec
	vw_set_tx_pin(5); // Data pin on arduino


	//Interrupt for rainmeter and windSpeed tick
	attachInterrupt(digitalPinToInterrupt(hallPinRainMeter), rainMeter, FALLING);
	attachInterrupt(digitalPinToInterrupt(hallPinWindSpeed), windIncrement, FALLING);

	//Initialize Variable for wind average calcul
	for (int i = 0; i < windHistoryNumber; ++i)
	{
    	windHistory[i] = 0.0f;
	}
}


//Main program loop.
void loop()
{
	// Start hall sensor for wind speed
	mcp.digitalWrite(0, HIGH);

	// Start battery test
	digitalWrite(9, HIGH);
	delay(10);
	float b = analogRead(A0);
	float c = (b*(2.88f/1023.0f)) / (220.0f / (1000.0f + 220.0f));
	int minValue = (1023 * TensionMin) / (2.88f / (220.0f / (1000.0f + 220.0f)));
  	int maxValue = (1023 * TensionMax) / (2.88f / (220.0f / (1000.0f + 220.0f)));
	int battery = ((b - minValue) * 100) / (maxValue - minValue); // % transform
	if (battery > 100)
	{
    	battery = 100;
	}
	else if (battery < 0)
	{
    	battery = 0;
	}
	delay(10);
	digitalWrite(9, LOW);

	// start counting time
	if(millisLastTime > millis())
	{
		myMinute = 0;
		millisLastTime = 0;
	}
	myMinute += static_cast<float>((millis() - millisLastTime)) / 60000.0f;

	// set string of sensor data and serial
	String serial(serialNumber);
	String stringOfAllSensorData;

	// Read DHT22
	float humidityDHT22 = dht22.readHumidity();
	float temperatureDHT22 = dht22.readTemperature();

	// single precision temperature
	String singlePrecisionaverageActualTemperature(temperatureDHT22, 1);

	// Cast float humidity to interger in String
	String intHumidity(humidityDHT22, 0);

	// Set single precision of temperatureDHT22 and put in a String
	String floatSinglePrecisionTemperatureDHT22(temperatureDHT22, 1);

	// Wind direction
	delay(10);
	String windDirection = "NoData";
	if(!mcp.digitalRead(4))
	{
		windDirection = "S";
	}
	if(!mcp.digitalRead(11))
	{
		windDirection = "SW";
	}
	if(!mcp.digitalRead(10))
	{
		windDirection = "W";
	}
	if(!mcp.digitalRead(9))
	{
		windDirection = "NW";
	}
	if(!mcp.digitalRead(8))
	{
		windDirection = "N";
	}
	if(!mcp.digitalRead(7))
	{
		windDirection = "NE";
	}
	if(!mcp.digitalRead(6))
	{
		windDirection = "E";
	}
	if(!mcp.digitalRead(5))
	{
		windDirection = "SE";
	}
	if(!mcp.digitalRead(4) && !mcp.digitalRead(11))
	{
		windDirection = "SSW";
	}
	if(!mcp.digitalRead(10) && !mcp.digitalRead(11))
	{
		windDirection = "WSW";
	}
	if(!mcp.digitalRead(9) && !mcp.digitalRead(10))
	{
		windDirection = "WNW";
	}
	if(!mcp.digitalRead(8) && !mcp.digitalRead(9))
	{
		windDirection = "NNW";
	}
	if(!mcp.digitalRead(7) && !mcp.digitalRead(8))
	{
		windDirection = "NNE";
	}
	if(!mcp.digitalRead(6) && !mcp.digitalRead(7))
	{
		windDirection = "ENE";
	}
	if(!mcp.digitalRead(5) && !mcp.digitalRead(6))
	{
		windDirection = "ESE";
	}
	if(!mcp.digitalRead(4) && !mcp.digitalRead(5))
	{
		windDirection = "SSE";
	}
	// Serial.println(windDirection); //debug

	// Wind speed
	int windCountFromLastTime = windCounter - windCountLastTime;
	windCountLastTime = windCounter;
	unsigned long timeFromLastTime = (millis() - millisLastTime) + sleepTime;
	if (0 == millisLastTime)
	{
		timeFromLastTime = sleepTime;
	}
	millisLastTime = millis();
	float tourParS = 0.0f;
	float windSpeed = 0.0f;

	if (windCountFromLastTime > 0)
	{
		tourParS = 1000.0f * static_cast<float>(windCountFromLastTime) / static_cast<float>(timeFromLastTime);
		// Vitesse = 3.6(3600s per hours divide by 1000 for kilometre) * 2pi * diametre until center of spoon * loop by seconde
		// Serial.println(tourParS); //debug
		windSpeed = 3.6*2*3.14*spoonDistance*tourParS;
		windSpeed *= corectionWindSpeed;
		// Serial.println(windSpeed); //debug
	}

	// Calcul of average windspeed of last 120 measure
	windHistory[currentIndex] = windSpeed;
	currentIndex = (currentIndex + 1) % windHistoryNumber;
	float averageWind = 0.0f;
	for(int i = 0; i<windHistoryNumber; i++)
	{
		averageWind += windHistory[i];
	}
	if (averageWind != 0.0f)
	{
		averageWind /= windHistoryNumber;
		// Short sleep time if windy during last 120 measure
		sleepTime = 5000;
	}
	else
	{
		sleepTime = 30000;
	}

	// single precision wind
	String singlePrecisionAverageWind(averageWind, 1);
	String singlePrecisionWind(windSpeed, 1);

	// Turn off Hall sensor for wind direction
	mcp.digitalWrite(0, LOW);

	// Build global String
	stringOfAllSensorData = serial;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += singlePrecisionaverageActualTemperature;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += intHumidity;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += waterCounter;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += singlePrecisionAverageWind;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += singlePrecisionWind;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += windDirection;
	stringOfAllSensorData += " ";
	stringOfAllSensorData += battery;
	Serial.println(stringOfAllSensorData); //debug

	// Number of message send every cycle
	int repeatnumber = 6;
	// send loop with repeat number
	while(repeatnumber > 0, repeatnumber--)
	{
		// send global string with all sensor data
		vw_send((uint8_t*)stringOfAllSensorData.c_str(), stringOfAllSensorData.length());
		vw_wait_tx(); // Wait until the whole message is gone
		delay(100);
	}

	//Erase rain and wind data if no change during 2 hours
	Serial.println(myMinute); //debug
	if((myMinute - minuteAtLastEraseCheck)> 120)
  	{

    	if(waterCounter == oldWaterCount)
		{
			waterCounter = 0;
			// Serial.println("water erase"); //debug
		}
		oldWaterCount = waterCounter;
		if(windCounter == oldWindCounter)
		{
			// Serial.println("wind erase"); //debug
			windCounter = 0;
			windCountLastTime = 0;
		}
		oldWindCounter = windCounter;
		minuteAtLastEraseCheck = myMinute;
	}
 	delay(100);

	// Sleep until next sensor read
  	sleep.pwrDownMode(); //set sleep mode
  	sleep.sleepDelay(sleepTime);
  	delay(1000);
	myMinute += static_cast<float>(sleepTime) / 60000.0f;
}

void rainMeter()
{
    waterCounter ++;
}
void windIncrement()
{
	windCounter ++;
}

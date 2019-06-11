from __future__ import print_function # Python 2/3 compatibility
import json
import boto3
import decimal

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('caloriesandsugar')

with open("output.json") as json_file:
    foods = json.load(json_file, parse_float = decimal.Decimal)
    for foodItem in foods:
        print(foodItem['Food'])
        food = foodItem['Food'].lower()
        vareity = foodItem['Variety']
        addedsugar = foodItem['Added_Sugars']
        calories = foodItem['Calories']
        portionamount= foodItem['Portion_Amount']
        preorpost = foodItem['Preorpost']
        unit = foodItem['Unit']
     

        print("Adding food:",  food)

        table.put_item(
           Item={
               'food': food,
               'vareity': vareity,
               'addedsugar': addedsugar,
               'calories' : calories,
               'portionamount' : portionamount,
               'preorpost' : preorpost,
               'unit': unit
               
            }
      )
  
  
  
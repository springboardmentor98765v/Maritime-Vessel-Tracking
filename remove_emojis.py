import os
import sys
import emoji

filepath = r'c:\Users\LENOVO\Desktop\teamm3\Milestone 4 - Database Cleaning and Standardization.md'

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Using emoji package to replace emojis with empty string
text_no_emoji = emoji.replace_emoji(text, replace='')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text_no_emoji)

print("Emojis removed successfully.")

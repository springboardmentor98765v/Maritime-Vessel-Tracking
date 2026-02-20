from rest_framework import serializers

def validate_latitude(value):
    if not (-90 <= value <= 90):
        raise serializers.ValidationError("Invalid latitude")

def validate_longitude(value):
    if not (-180 <= value <= 180):
        raise serializers.ValidationError("Invalid longitude")

package com.sahil.realestateai.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendInquiryNotification(
            String recipientEmail,
            String customerName,
            Long propertyId) {

        try {
            Map<String, String> event = new HashMap<>();

            event.put("eventType", "PROPERTY_INQUIRY_CREATED");
            event.put("recipientEmail", recipientEmail);
            event.put(
                "message",
                customerName + " has sent an inquiry for property ID: " + propertyId
            );

            String jsonMessage = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(
                "realestate-notifications",
                jsonMessage
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException(
                "Failed to serialize notification event", e
            );
        }
    }
}
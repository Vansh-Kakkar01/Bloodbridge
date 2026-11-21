package com.bloodbridge.controller;

import com.bloodbridge.model.Donor;
import com.bloodbridge.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin(origins = "*")
public class MatchingController {

    @Autowired
    private DonorRepository donorRepository;

    public List<String> getCompatibleDonorTypes(String recipientBloodGroup) {
        switch (recipientBloodGroup.toUpperCase()) {
            case "O_POS": return Arrays.asList("O_POS", "O_NEG");
            case "O_NEG": return Arrays.asList("O_NEG");
            case "A_POS": return Arrays.asList("A_POS", "A_NEG", "O_POS", "O_NEG");
            case "A_NEG": return Arrays.asList("A_NEG", "O_NEG");
            case "B_POS": return Arrays.asList("B_POS", "B_NEG", "O_POS", "O_NEG");
            case "B_NEG": return Arrays.asList("B_NEG", "O_NEG");
            case "AB_POS": return Arrays.asList("A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG");
            case "AB_NEG": return Arrays.asList("AB_NEG", "A_NEG", "B_NEG", "O_NEG");
            default: return new ArrayList<>();
        }
    }

    @PostMapping("/broadcast")
    public ResponseEntity<List<Donor>> triggerEmergencyMatch(@RequestBody EmergencyRequest request) {
        List<String> compatibleTypes = getCompatibleDonorTypes(request.getBloodGroup());
        Point hospitalLocation = new Point(request.getLongitude(), request.getLatitude());
        
        double radiusKm = request.getUrgencyLevel().equalsIgnoreCase("CRITICAL") ? 5.0 : 15.0;
        Distance searchDistance = new Distance(radiusKm, Metrics.KILOMETERS);

        List<Donor> matchedDonors = new ArrayList<>();

        for (String bloodType : compatibleTypes) {
            List<Donor> donors = donorRepository.findByBloodGroupAndIsAvailableTrueAndLocationNear(
                bloodType, hospitalLocation, searchDistance
            );
            matchedDonors.addAll(donors);
        }

        return ResponseEntity.ok(matchedDonors);
    }
}

class EmergencyRequest {
    private String bloodGroup;
    private double longitude;
    private double latitude;
    private String urgencyLevel;

    public String getBloodGroup() { return bloodGroup; }
    public double getLongitude() { return longitude; }
    public double getLatitude() { return latitude; }
    public String getUrgencyLevel() { return urgencyLevel; }
}
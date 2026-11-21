package com.bloodbridge.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "donors")
public class Donor {

    @Id
    private String id;
    private String name;
    private String phoneNumber;

    @Indexed
    private String bloodGroup;

    private boolean isAvailable = true;
    private boolean isVerified = true;
    private int donationCount = 3;

    @GeoSpatialIndexed(type = org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE)
    private Point location;

    public Donor() {}

    public Donor(String name, String phoneNumber, String bloodGroup, double longitude, double latitude) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.bloodGroup = bloodGroup;
        this.isAvailable = true;
        this.isVerified = true;
        this.donationCount = (int) (Math.random() * 5) + 1;
        this.location = new Point(longitude, latitude);
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getBloodGroup() { return bloodGroup; }
    public boolean isAvailable() { return isAvailable; }
    public boolean isVerified() { return isVerified; }
    public int getDonationCount() { return donationCount; }
    public Point getLocation() { return location; }
}
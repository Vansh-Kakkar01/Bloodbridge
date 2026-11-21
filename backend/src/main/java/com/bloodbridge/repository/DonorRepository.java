package com.bloodbridge.repository;

import com.bloodbridge.model.Donor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DonorRepository extends MongoRepository<Donor, String> {
    List<Donor> findByBloodGroupAndIsAvailableTrueAndIsVerifiedTrueAndLocationNear(
            String bloodGroup,
            Point location,
            Distance distance
    );
}
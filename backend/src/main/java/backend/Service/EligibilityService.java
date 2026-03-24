package backend.Service;

import backend.Model.Donor;
import java.time.LocalDate;
import java.time.Period;

import org.springframework.stereotype.Service;

@Service
public class EligibilityService {

    /**
     * Check if a donor is eligible to donate blood
     * Rules:
     * 1. Age must be 18 or above
     * 2. Weight must be above 50 kg
     * 3. Last donation date must be at least 4 months ago
     */
    public String checkEligibility(Donor donor) {
        // Rule 1: Check age
        if (donor.getAge() == null || donor.getAge() < 18) {
            return "NOT_ELIGIBLE - Age must be 18 or above";
        }

        // Rule 2: Check weight
        if (donor.getWeight() == null || donor.getWeight() <= 50) {
            return "NOT_ELIGIBLE - Weight must be above 50 kg";
        }

        // Rule 3: Check last donation date
        if (donor.getLastDonationDate() != null) {
            LocalDate lastDonation = donor.getLastDonationDate();
            LocalDate today = LocalDate.now();
            int monthsBetween = Period.between(lastDonation, today).getMonths();

            if (monthsBetween < 4) {
                return "NOT_ELIGIBLE - Last donation must be at least 4 months ago";
            }
        }

        // All rules passed
        return "ELIGIBLE";
    }

    /**
     * Get a detailed eligibility message for the donor
     */
    public String getDetailedEligibilityMessage(Donor donor) {
        StringBuilder message = new StringBuilder();
        boolean isEligible = true;

        // Check age
        if (donor.getAge() == null || donor.getAge() < 18) {
            message.append("Age must be 18 or above. ");
            isEligible = false;
        }

        // Check weight
        if (donor.getWeight() == null || donor.getWeight() <= 50) {
            message.append("Weight must be above 50 kg. ");
            isEligible = false;
        }

        // Check last donation date
        if (donor.getLastDonationDate() != null) {
            LocalDate lastDonation = donor.getLastDonationDate();
            LocalDate today = LocalDate.now();
            int monthsBetween = Period.between(lastDonation, today).getMonths();

            if (monthsBetween < 4) {
                int remainingMonths = 4 - monthsBetween;
                message.append("Must wait ").append(remainingMonths).append(" more months since last donation. ");
                isEligible = false;
            }
        }

        return isEligible ? "You are eligible to donate blood." : message.toString();
    }
}

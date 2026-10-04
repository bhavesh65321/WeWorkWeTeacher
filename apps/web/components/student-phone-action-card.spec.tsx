import { render, screen } from "@testing-library/react";
import { StudentPhoneActionCard } from "./student-phone-action-card";
import type { Me } from "@/lib/api";

describe("StudentPhoneActionCard", () => {
  const mockUser: Me = {
    id: "user-123",
    email: "student@example.com",
    name: "John Student",
    roles: ["STUDENT"],
    activeRole: "STUDENT",
    tutorSlug: null,
    coinBalance: 100,
    isPremium: false,
    isAdmin: false,
    referralCode: "code-123",
    phone: null,
    city: "Mumbai",
    country: "India",
    onboardingComplete: true,
    tutorOnboardingComplete: false,
    emailVerified: true,
    phoneVerified: false,
    hasPassword: true,
  };

  describe("AC2: Dashboard shows action card if phone missing", () => {
    it("should show action card when phone is missing", () => {
      // Arrange
      const userWithoutPhone = { ...mockUser, phone: null };

      // Act
      render(<StudentPhoneActionCard user={userWithoutPhone} />);

      // Assert
      expect(screen.getByText("Add your phone number")).toBeInTheDocument();
      expect(screen.getByText(/Tutors need your phone number/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Add phone/ })).toBeInTheDocument();
    });

    it("should not show action card when phone is present", () => {
      // Arrange
      const userWithPhone = { ...mockUser, phone: "+919876543210" };

      // Act
      const { container } = render(<StudentPhoneActionCard user={userWithPhone} />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("should link to settings page", () => {
      // Arrange
      const userWithoutPhone = { ...mockUser, phone: null };

      // Act
      render(<StudentPhoneActionCard user={userWithoutPhone} />);

      // Assert
      const link = screen.getByRole("link", { name: /Add phone/ });
      expect(link).toHaveAttribute("href", "/settings");
    });

    it("should display clear messaging", () => {
      // Arrange
      const userWithoutPhone = { ...mockUser, phone: null };

      // Act
      render(<StudentPhoneActionCard user={userWithoutPhone} />);

      // Assert
      expect(screen.getByText("Add your phone number")).toBeInTheDocument();
      expect(
        screen.getByText("Tutors need your phone number to contact you after payment")
      ).toBeInTheDocument();
    });
  });
});

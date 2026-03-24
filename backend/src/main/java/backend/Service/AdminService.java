package backend.Service;

import backend.Model.Admin;
import backend.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    public Admin createAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Admin updateAdmin(Long id, Admin admin) {
        Optional<Admin> existingAdmin = adminRepository.findById(id);
        if (existingAdmin.isPresent()) {
            Admin adminToUpdate = existingAdmin.get();
            adminToUpdate.setFullName(admin.getFullName());
            adminToUpdate.setEmail(admin.getEmail());
            adminToUpdate.setPassword(admin.getPassword());
            adminToUpdate.setRole(admin.getRole());
            return adminRepository.save(adminToUpdate);
        }
        return null;
    }

    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }

    public boolean emailExists(String email) {
        return adminRepository.existsByEmail(email);
    }
}

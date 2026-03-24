package backend.Repository;

import backend.Model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ChatHistoryRepository - Data access layer for chat history
 */
@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    /**
     * Find all chat messages for a specific session
     */
    List<ChatHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    /**
     * Find all chat messages for a specific donor
     */
    List<ChatHistory> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    
    /**
     * Find chat messages for a donor in a specific session
     */
    List<ChatHistory> findByDonorIdAndSessionIdOrderByCreatedAtAsc(Long donorId, String sessionId);
    
    /**
     * Find all chat messages created after a specific time
     */
    List<ChatHistory> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime dateTime);
    
    /**
     * Find all chat messages created between two times
     */
    @Query("SELECT c FROM ChatHistory c WHERE c.createdAt BETWEEN :startDate AND :endDate ORDER BY c.createdAt DESC")
    List<ChatHistory> findChatsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Search chat messages by keywords
     */
    @Query("SELECT c FROM ChatHistory c WHERE c.userMessage LIKE %:keyword% OR c.botResponse LIKE %:keyword% ORDER BY c.createdAt DESC")
    List<ChatHistory> searchChatMessages(@Param("keyword") String keyword);
    
    /**
     * Count total number of chat conversations
     */
    long countBySessionId(String sessionId);
    
    /**
     * Get latest chat message for a session
     */
    ChatHistory findFirstBySessionIdOrderByCreatedAtDesc(String sessionId);
}

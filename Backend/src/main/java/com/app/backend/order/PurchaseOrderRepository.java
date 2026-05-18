package com.app.backend.order;

import com.app.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByUserOrderByCreatedAtDesc(User user);
}

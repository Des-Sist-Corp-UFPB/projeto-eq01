package br.ufpb.dsc.nexushub.model.payments.repository;
import br.ufpb.dsc.nexushub.model.payments.domain.Product;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("paymentsProductRepository")
public interface ProductRepository extends JpaRepository<Product,UUID>{List<Product> findByActiveTrue();}

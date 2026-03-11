package com.blogplatform.config;

import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;
        log.info("Seeding demo data...");

        // Categories
        Category tech = categoryRepository.save(Category.builder().name("Technology").slug("technology").description("Tech articles").color("#3B82F6").build());
        Category design = categoryRepository.save(Category.builder().name("Design").slug("design").description("Design articles").color("#8B5CF6").build());
        Category career = categoryRepository.save(Category.builder().name("Career").slug("career").description("Career advice").color("#10B981").build());

        // Tags
        Tag java = tagRepository.save(Tag.builder().name("Java").slug("java").build());
        Tag spring = tagRepository.save(Tag.builder().name("Spring Boot").slug("spring-boot").build());
        Tag react = tagRepository.save(Tag.builder().name("React").slug("react").build());
        Tag webdev = tagRepository.save(Tag.builder().name("Web Dev").slug("web-dev").build());
        Tag ai = tagRepository.save(Tag.builder().name("AI").slug("ai").build());

        // Admin user
        User admin = userRepository.save(User.builder()
            .username("admin")
            .email("admin@blog.com")
            .password(passwordEncoder.encode("admin123"))
            .bio("Platform administrator and tech enthusiast.")
            .roles(Set.of("USER", "ADMIN"))
            .enabled(true)
            .build());

        // Regular users
        User alice = userRepository.save(User.builder()
            .username("alice")
            .email("alice@blog.com")
            .password(passwordEncoder.encode("alice123"))
            .bio("Full-stack developer passionate about clean code and great UX.")
            .roles(Set.of("USER"))
            .enabled(true)
            .build());

        User bob = userRepository.save(User.builder()
            .username("bob")
            .email("bob@blog.com")
            .password(passwordEncoder.encode("bob123"))
            .bio("Designer & developer. I write about the intersection of art and technology.")
            .roles(Set.of("USER"))
            .enabled(true)
            .build());

        // Posts
        Post p1 = Post.builder()
            .title("Building a RESTful API with Spring Boot 3")
            .slug("building-restful-api-spring-boot-3")
            .content("""
                # Building a RESTful API with Spring Boot 3
                
                Spring Boot 3 brings exciting new features including native compilation support and improved observability. In this comprehensive guide, we'll build a production-ready REST API from scratch.
                
                ## Setting Up Your Project
                
                Start by creating a new Spring Boot project using Spring Initializr. Select the following dependencies:
                - Spring Web
                - Spring Data JPA
                - Spring Security
                - H2 Database (for development)
                
                ## Project Structure
                
                A well-organized Spring Boot project follows the layered architecture pattern:
                
                ```
                src/main/java/com/example/
                ├── controller/   # REST controllers
                ├── service/      # Business logic
                ├── repository/   # Data access layer
                ├── model/        # JPA entities
                ├── dto/          # Data transfer objects
                └── config/       # Configuration classes
                ```
                
                ## Defining Your Entities
                
                With Spring Data JPA, define your entities as simple POJOs with JPA annotations...
                
                ## Security with JWT
                
                Implementing JWT-based authentication ensures your API is stateless and scalable. The key components are the JWT filter, UserDetailsService, and SecurityConfig.
                
                ## Conclusion
                
                Spring Boot 3 makes building secure, production-ready APIs faster than ever. The combination of Spring Security, Spring Data JPA, and Springdoc OpenAPI gives you a powerful toolkit for modern backend development.
                """)
            .excerpt("A comprehensive guide to building production-ready REST APIs with Spring Boot 3, covering JWT auth, JPA, and best practices.")
            .author(alice)
            .category(tech)
            .tags(Set.of(java, spring, webdev))
            .status(Post.PostStatus.PUBLISHED)
            .publishedAt(LocalDateTime.now().minusDays(5))
            .readTime(8)
            .build();

        Post p2 = Post.builder()
            .title("React in 2025: What Every Developer Should Know")
            .slug("react-2025-developer-guide")
            .content("""
                # React in 2025: What Every Developer Should Know
                
                The React ecosystem has matured significantly. Server components, concurrent features, and improved tooling have changed how we build UIs.
                
                ## React Server Components
                
                Server Components represent a paradigm shift — components that render on the server with direct access to your data layer, zero client-side JavaScript footprint.
                
                ## The New Hooks
                
                `useOptimistic`, `useFormStatus`, and `useActionState` are game-changers for form handling and optimistic updates.
                
                ## Build Tools
                
                Vite has become the de-facto standard for React development. Its blazing fast HMR and native ES modules support make it a joy to work with.
                
                ## State Management in 2025
                
                With Zustand, Jotai, and React Query dominating, the Redux era is effectively over for new projects. Choose the right tool for your complexity level.
                
                ## Conclusion
                
                React continues to evolve thoughtfully. Staying current means understanding not just the APIs, but the underlying mental models.
                """)
            .excerpt("The React ecosystem has evolved dramatically. Here's what you need to know about Server Components, new hooks, and modern patterns.")
            .author(alice)
            .category(tech)
            .tags(Set.of(react, webdev))
            .status(Post.PostStatus.PUBLISHED)
            .publishedAt(LocalDateTime.now().minusDays(2))
            .readTime(6)
            .build();

        Post p3 = Post.builder()
            .title("Design Systems: Building for Scale")
            .slug("design-systems-building-for-scale")
            .content("""
                # Design Systems: Building for Scale
                
                A well-crafted design system is the foundation of any scalable product. It's not just a component library — it's a shared language between designers and developers.
                
                ## What Makes a Great Design System?
                
                The best design systems share common traits: clear documentation, consistent naming, accessible components, and a strong governance model.
                
                ## Tokens: The Atomic Unit
                
                Design tokens are the foundational values — colors, spacing, typography — that cascade through your system. Get these right and everything else follows.
                
                ## Component API Design
                
                Think deeply about component interfaces. The API surface determines how easy it is to use components correctly and how hard it is to use them incorrectly.
                
                ## Versioning and Evolution
                
                Your design system will change. Plan for this from day one with semantic versioning, changelogs, and migration guides.
                """)
            .excerpt("How to build design systems that scale with your team and product — from tokens to components to governance.")
            .author(bob)
            .category(design)
            .tags(Set.of(webdev))
            .status(Post.PostStatus.PUBLISHED)
            .publishedAt(LocalDateTime.now().minusDays(7))
            .readTime(5)
            .build();

        Post p4 = Post.builder()
            .title("AI-Powered Development: The New Normal")
            .slug("ai-powered-development-new-normal")
            .content("""
                # AI-Powered Development: The New Normal
                
                AI coding assistants have moved from novelty to necessity. But how do you use them effectively without becoming dependent on them?
                
                ## What AI Does Well
                
                Boilerplate generation, pattern completion, test writing, and documentation — AI excels at the repetitive parts of development.
                
                ## Where Human Judgment Still Wins
                
                Architecture decisions, debugging complex systems, understanding business context, and writing truly creative solutions still require human insight.
                
                ## Staying Sharp
                
                The danger isn't that AI replaces developers — it's that developers stop learning the fundamentals. Use AI as a multiplier, not a crutch.
                
                ## The Future
                
                AI will continue to automate more of the "what" of programming. The "why" — the strategy, judgment, and creativity — remains irreducibly human.
                """)
            .excerpt("AI tools are transforming how we write code. Here's how to use them as a force multiplier without losing your core skills.")
            .author(admin)
            .category(tech)
            .tags(Set.of(ai, webdev))
            .status(Post.PostStatus.PUBLISHED)
            .publishedAt(LocalDateTime.now().minusDays(1))
            .readTime(4)
            .build();

        postRepository.saveAll(List.of(p1, p2, p3, p4));

        // Add some likes
        p1.getLikedByUserIds().addAll(Set.of(admin.getId(), bob.getId()));
        p2.getLikedByUserIds().addAll(Set.of(admin.getId()));
        p3.getLikedByUserIds().addAll(Set.of(alice.getId(), admin.getId()));
        p4.getLikedByUserIds().addAll(Set.of(alice.getId(), bob.getId()));
        postRepository.saveAll(List.of(p1, p2, p3, p4));

        log.info("Demo data seeded successfully. Login: alice/alice123, bob/bob123, admin/admin123");
    }
}

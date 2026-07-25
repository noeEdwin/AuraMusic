package com.auramusic.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;


@Component
@Profile("local")
public class DatabaseSeedRunner implements CommandLineRunner{
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public DatabaseSeedRunner (JdbcTemplate jdbcTemplate, DataSource dataSource){
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }
    
    @Override
    public void run(String... args){
        Integer roleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rols", Integer.class);

        if (roleCount != null && roleCount > 0){
            return;
        }

        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(new ClassPathResource("db/seed/local_seed.sql"));
        populator.execute(dataSource);
    }
}
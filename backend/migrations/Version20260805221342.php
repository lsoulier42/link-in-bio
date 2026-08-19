<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260805221342 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema (MySQL 8.4) : user, profile, link';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE link (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(128) NOT NULL, url VARCHAR(512) NOT NULL, icon_name VARCHAR(64) DEFAULT NULL, position INT NOT NULL, is_active TINYINT NOT NULL, click_count INT NOT NULL, profile_id INT NOT NULL, INDEX IDX_36AC99F1CCFA12B8 (profile_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE profile (id INT AUTO_INCREMENT NOT NULL, slug VARCHAR(64) NOT NULL, display_name VARCHAR(128) NOT NULL, bio LONGTEXT DEFAULT NULL, avatar_url VARCHAR(512) DEFAULT NULL, theme_name VARCHAR(32) DEFAULT \'dark\' NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_8157AA0F989D9B62 (slug), INDEX IDX_8157AA0FA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE link ADD CONSTRAINT FK_36AC99F1CCFA12B8 FOREIGN KEY (profile_id) REFERENCES profile (id)');
        $this->addSql('ALTER TABLE profile ADD CONSTRAINT FK_8157AA0FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE link DROP FOREIGN KEY FK_36AC99F1CCFA12B8');
        $this->addSql('ALTER TABLE profile DROP FOREIGN KEY FK_8157AA0FA76ED395');
        $this->addSql('DROP TABLE link');
        $this->addSql('DROP TABLE profile');
        $this->addSql('DROP TABLE `user`');
    }
}

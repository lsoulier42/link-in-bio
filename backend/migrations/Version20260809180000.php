<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260809180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add background fields to profile';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE profile ADD background_url VARCHAR(512) DEFAULT NULL, ADD background_overlay SMALLINT DEFAULT 60 NOT NULL, ADD background_size VARCHAR(16) DEFAULT \'cover\' NOT NULL, ADD background_position VARCHAR(16) DEFAULT \'center\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE profile DROP background_url, DROP background_overlay, DROP background_size, DROP background_position');
    }
}

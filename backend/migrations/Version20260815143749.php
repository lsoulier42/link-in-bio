<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260815143749 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add font family customization columns to profile (name, bio, category titles)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profile ADD name_font VARCHAR(32) DEFAULT NULL, ADD bio_font VARCHAR(32) DEFAULT NULL, ADD category_font VARCHAR(32) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profile DROP name_font, DROP bio_font, DROP category_font');
    }
}

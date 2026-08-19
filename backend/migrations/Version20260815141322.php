<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260815141322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add text color customization columns to profile (name, bio, category titles)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profile ADD name_color VARCHAR(9) DEFAULT NULL, ADD bio_color VARCHAR(9) DEFAULT NULL, ADD category_color VARCHAR(9) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profile DROP name_color, DROP bio_color, DROP category_color');
    }
}

<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260809223000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add category table and nullable category_id on link';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, profile_id INT NOT NULL, name VARCHAR(128) NOT NULL, position INT NOT NULL, INDEX IDX_64C19C1CCFA12B8 (profile_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1CCFA12B8 FOREIGN KEY (profile_id) REFERENCES profile (id)');
        $this->addSql('ALTER TABLE link ADD category_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE link ADD CONSTRAINT FK_36AC99F112469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_36AC99F112469DE2 ON link (category_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE link DROP FOREIGN KEY FK_36AC99F112469DE2');
        $this->addSql('DROP INDEX IDX_36AC99F112469DE2 ON link');
        $this->addSql('ALTER TABLE link DROP category_id');
        $this->addSql('DROP TABLE category');
    }
}

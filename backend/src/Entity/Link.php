<?php

namespace App\Entity;

use App\Repository\LinkRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LinkRepository::class)]
class Link
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Profile::class, inversedBy: 'links')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Profile $profile = null;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'links')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Category $category = null;

    #[ORM\Column(length: 128)]
    private ?string $title = null;

    #[ORM\Column(length: 512)]
    private ?string $url = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $iconName = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $networkType = null;

    #[ORM\Column(length: 128, nullable: true)]
    private ?string $handle = null;

    #[ORM\Column(length: 128, nullable: true)]
    private ?string $displayName = null;

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $avatarUrl = null;

    #[ORM\Column(length: 128, nullable: true)]
    private ?string $subtitle = null;

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $iconUrl = null;

    #[ORM\Column(length: 16, options: ['default' => 'card'])]
    private string $displayStyle = 'card';

    #[ORM\Column(type: 'integer')]
    private int $position = 0;

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\Column(type: 'integer')]
    private int $clickCount = 0;

    public function getId(): ?int { return $this->id; }

    public function getProfile(): ?Profile { return $this->profile; }
    public function setProfile(?Profile $profile): static { $this->profile = $profile; return $this; }

    public function getCategory(): ?Category { return $this->category; }
    public function setCategory(?Category $category): static { $this->category = $category; return $this; }

    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $title): static { $this->title = $title; return $this; }

    public function getUrl(): ?string { return $this->url; }
    public function setUrl(string $url): static { $this->url = $url; return $this; }

    public function getIconName(): ?string { return $this->iconName; }
    public function setIconName(?string $iconName): static { $this->iconName = $iconName; return $this; }

    public function getNetworkType(): ?string { return $this->networkType; }
    public function setNetworkType(?string $networkType): static { $this->networkType = $networkType; return $this; }

    public function getHandle(): ?string { return $this->handle; }
    public function setHandle(?string $handle): static { $this->handle = $handle; return $this; }

    public function getDisplayName(): ?string { return $this->displayName; }
    public function setDisplayName(?string $displayName): static { $this->displayName = $displayName; return $this; }

    public function getAvatarUrl(): ?string { return $this->avatarUrl; }
    public function setAvatarUrl(?string $avatarUrl): static { $this->avatarUrl = $avatarUrl; return $this; }

    public function getSubtitle(): ?string { return $this->subtitle; }
    public function setSubtitle(?string $subtitle): static { $this->subtitle = $subtitle; return $this; }

    public function getIconUrl(): ?string { return $this->iconUrl; }
    public function setIconUrl(?string $iconUrl): static { $this->iconUrl = $iconUrl; return $this; }

    public function getDisplayStyle(): string { return $this->displayStyle; }
    public function setDisplayStyle(string $displayStyle): static { $this->displayStyle = $displayStyle; return $this; }

    public function getPosition(): int { return $this->position; }
    public function setPosition(int $position): static { $this->position = $position; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getClickCount(): int { return $this->clickCount; }
    public function setClickCount(int $clickCount): static { $this->clickCount = $clickCount; return $this; }

    public function incrementClickCount(): static { $this->clickCount++; return $this; }
}

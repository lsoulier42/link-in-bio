<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:promote-user',
    description: 'Promote a user to admin (or demote with --demote)',
)]
class PromoteUserCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'User email address')
            ->addOption('role', null, InputOption::VALUE_REQUIRED, 'Role to grant', 'ROLE_ADMIN')
            ->addOption('demote', null, InputOption::VALUE_NONE, 'Remove the role instead of granting it')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        $role = $input->getOption('role');
        $demote = $input->getOption('demote');

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) {
            $io->error(sprintf('No user found with email "%s".', $email));
            return Command::FAILURE;
        }

        $hasRole = in_array($role, $user->getRoles(), true);

        if ($demote) {
            if (!$hasRole) {
                $io->warning(sprintf('User "%s" does not have role %s.', $email, $role));
                return Command::SUCCESS;
            }
            $roles = array_values(array_filter($user->getRoles(), fn($r) => $r !== $role));
            $user->setRoles($roles);
            $io->success(sprintf('Role %s removed from user "%s".', $role, $email));
        } else {
            if ($hasRole) {
                $io->warning(sprintf('User "%s" already has role %s.', $email, $role));
                return Command::SUCCESS;
            }
            $roles = array_unique([...$user->getRoles(), $role]);
            $user->setRoles($roles);
            $io->success(sprintf('Role %s granted to user "%s".', $role, $email));
        }

        $this->em->flush();

        $io->table(
            ['Field', 'Value'],
            [
                ['Email', $email],
                ['Roles', implode(', ', $user->getRoles())],
            ]
        );

        return Command::SUCCESS;
    }
}
